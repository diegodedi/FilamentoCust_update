import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useDb } from './DbContext';
import { PrinterIntegrationService, PrinterState } from '../services/PrinterService';
import { PrintJob } from '../types';

import { checkBridgeHealth } from '../services/PrinterService';

interface PrinterContextType {
  bridgeOnline: boolean;
  activeStates: Record<string, PrinterState>;
  checkBridgeStatus: () => Promise<void>;
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export const PrinterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { printers, addPrintJob, updatePrintJob, registerMovement, updateMaterialWeight, products, printJobs } = useDb();
  
  const [bridgeOnline, setBridgeOnline] = useState<boolean>(false);
  const [activeStates, setActiveStates] = useState<Record<string, PrinterState>>({});
  
  const serviceRef = useRef<PrinterIntegrationService | null>(null);
  
  // Track active jobs to avoid duplicates and handle completion
  const activeJobsRef = useRef<Record<string, { jobDbId: string, matchedProductId: string | null }>>({});

  
  const checkBridgeStatus = async () => {
    try {
      const { online } = await checkBridgeHealth();
      setBridgeOnline(online);
      if (!online) {
        setActiveStates(prev => {
          const next = { ...prev };
          for (const k in next) {
             next[k].status = 'OFFLINE';
          }
          return next;
        });
      }
    } catch (e) {
      setBridgeOnline(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      if (mounted) {
        await checkBridgeStatus();
      }
    };
    check();
    const int = setInterval(check, 3000);
    return () => { mounted = false; clearInterval(int); };
  }, []);

  const handlePrinterStateChangeRef = useRef<any>(null);
  
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new PrinterIntegrationService((printerId, state) => {
        setActiveStates(prev => ({ ...prev, [printerId]: state }));
        if (handlePrinterStateChangeRef.current) {
          handlePrinterStateChangeRef.current(printerId, state);
        }
      });
    }

    // Start/stop monitoring based on printers configuration
    const service = serviceRef.current;
    
    printers.forEach(printer => {
      if (printer.monitoringEnabled && printer.ip && printer.port) {
        // Simple check if it's already running is done inside startMonitoring by calling stop first, 
        // but it's better to avoid restarting every render.
        // We can track running printers.
        service.startMonitoring(printer.id, printer.ip, printer.port, printer.protocol);
      } else {
        service.stopMonitoring(printer.id);
      }
    });

    return () => {
      // Cleanup happens only on unmount
    };
  }, [printers]); // Re-run when printers config changes

  // Must keep fresh products and printJobs refs for the callback without re-triggering the effect
  const productsRef = useRef(products);
  useEffect(() => { productsRef.current = products; }, [products]);
  
  const printJobsRef = useRef(printJobs);
  useEffect(() => { printJobsRef.current = printJobs; }, [printJobs]);

  const normalizeName = (name: string) => {
    if (!name) return "";
    // Extract base name if it has paths
    const baseName = name.split('/').pop() || name;
    // Remove extension
    const noExt = baseName.replace(/\.[^/.]+$/, "");
    // Replace underscores and dashes with spaces, remove extra spaces and uppercase
    return noExt.replace(/[_-]/g, " ").trim().replace(/\s+/g, " ").toUpperCase();
  };

  const handlePrinterStateChange = (printerId: string, state: PrinterState) => {
    const printer = printers.find(p => p.id === printerId);
    if (!printer) return;

    const currentTrackedJob = activeJobsRef.current[printerId];

    if (state.status === 'PRINTING' || state.status === 'PAUSED') {
      if (!currentTrackedJob && state.jobId) {
        // Try to reconnect to an existing active job from the DB (e.g., after app reload)
        const existingJob = printJobsRef.current.find(j => 
          j.printerId === printerId && 
          j.fileName === state.filename && 
          (j.status === 'PRINTING' || j.status === 'PAUSED')
        );

        if (existingJob) {
          activeJobsRef.current[printerId] = { 
            jobDbId: existingJob.id, 
            matchedProductId: existingJob.productId 
          };
          // Also update progress
          updatePrintJob(existingJob.id, {
            progress: state.progress,
            duration: state.timeElapsed,
            status: state.status
          });
          return;
        }

        // New job detected
        const normName = normalizeName(state.filename);
        let matchedProduct = null;
        let matchedPart = null;

        for (const p of productsRef.current) {
          if (!normName) continue;
          const normProduct = normalizeName(p.name);
          if (normProduct) {
            // 1. Exact match
            if (normName === normProduct) {
              matchedProduct = p;
              break;
            }
            // 2. Contains match
            if (normName.includes(normProduct)) {
              matchedProduct = p;
              break;
            }
            // 3. Contains match reversed
            if (normProduct.includes(normName)) {
              matchedProduct = p;
              break;
            }
          }
        }

        if (!matchedProduct) {
          // Check parts
          for (const p of productsRef.current) {
            if (p.isMultipart && p.parts) {
              for (const pt of p.parts) {
                const normPart = normalizeName(pt.name);
                if (normPart) {
                  if (normName === normPart || normName.includes(normPart) || normPart.includes(normName)) {
                    matchedProduct = p;
                    matchedPart = pt;
                    break;
                  }
                }
              }
              if (matchedPart) break;
            }
          }
        }
        
        let filamentConsumption: any[] = [];
        if (matchedPart && matchedPart.filaments) {
          filamentConsumption = matchedPart.filaments.map(f => ({
            materialId: f.materialId,
            materialName: 'Material ' + f.materialId,
            plannedWeight: f.weight,
            consumedWeight: 0
          }));
        } else if (matchedPart && matchedPart.materialId) {
          filamentConsumption = [{
            materialId: matchedPart.materialId,
            materialName: 'Material',
            plannedWeight: matchedPart.weight,
            consumedWeight: 0
          }];
        } else if (matchedProduct && matchedProduct.filaments) {
          filamentConsumption = matchedProduct.filaments.map(f => ({
            materialId: f.materialId,
            materialName: 'Material ' + f.materialId,
            plannedWeight: f.weight,
            consumedWeight: 0
          }));
        } else if (matchedProduct && matchedProduct.materialId) {
          filamentConsumption = [{
            materialId: matchedProduct.materialId,
            materialName: 'Material',
            plannedWeight: matchedProduct.weight,
            consumedWeight: 0
          }];
        }

        const newJobDbId = addPrintJob({
          printerId: printer.id,
          printerName: printer.name,
          fileName: state.filename,
          normalizedFileName: normName,
          productId: matchedProduct ? matchedProduct.id : null,
          productName: matchedProduct ? matchedProduct.name : null,
          partId: matchedPart ? matchedPart.id : null,
          partName: matchedPart ? matchedPart.name : null,
          status: state.status,
          startedAt: new Date().toISOString(),
          completedAt: null,
          duration: 0,
          progress: state.progress,
          quantityProduced: state.plateQuantity || (matchedProduct ? matchedProduct.unitsPerPrint || 1 : 1),
          filamentConsumption,
          inventoryApplied: false
        });

        activeJobsRef.current[printerId] = { 
          jobDbId: newJobDbId, 
          matchedProductId: matchedProduct ? matchedProduct.id : null 
        };
      } else if (currentTrackedJob) {
        // Update progress
        const updates: any = {
          progress: state.progress,
          duration: state.timeElapsed,
          status: state.status
        };

        // Update filament consumption in real time during the print
        const job = printJobsRef.current.find(j => j.id === currentTrackedJob.jobDbId);
        if (job && state.filamentWeight !== undefined) {
           const actualWeightTotal = state.filamentWeight || 0;
           const plannedWeightTotal = job.filamentConsumption.reduce((sum, f) => sum + (f.plannedWeight || 0), 0);
           
           updates.filamentConsumption = job.filamentConsumption.map(f => {
               let consumed = actualWeightTotal > 0 ? 0 : f.consumedWeight;
               if (actualWeightTotal > 0 && plannedWeightTotal > 0) {
                 consumed = (f.plannedWeight / plannedWeightTotal) * actualWeightTotal;
               } else if (actualWeightTotal >= 0 && job.filamentConsumption.length === 1) {
                 consumed = actualWeightTotal;
               }
               
               // Ensure consumedWeight is properly set so the UI can display it over planned
               return { ...f, consumedWeight: consumed };
           });
        }

        updatePrintJob(currentTrackedJob.jobDbId, updates);
      }
    } else if (state.status === 'COMPLETED') {
      let jobDbId = currentTrackedJob?.jobDbId;
      
      // If the app just reloaded, currentTrackedJob might be undefined, but the job might still be PRINTING in the DB
      if (!jobDbId) {
        const existingJob = printJobsRef.current.find(j => 
          j.printerId === printerId && 
          j.fileName === state.filename && 
          (j.status === 'PRINTING' || j.status === 'PAUSED')
        );
        if (existingJob) {
          jobDbId = existingJob.id;
        }
      }

      if (jobDbId) {
        // Mark completed and apply inventory
        const job = printJobsRef.current.find(j => j.id === jobDbId);
        if (job && !job.inventoryApplied) {
           const producedQty = job.quantityProduced || 1;

           updatePrintJob(job.id, {
             status: 'COMPLETED',
             completedAt: new Date().toISOString(),
             progress: 1,
             duration: state.timeElapsed,
             quantityProduced: producedQty,
             inventoryApplied: true
           });

           if (job.productId) {
             // Add finished products/parts to inventory
             if (job.partId) {
               registerPartMovement(job.productId, job.partId, 'IN', producedQty);
             } else {
               registerMovement(job.productId, 'IN', producedQty);
             }
             
             // Deduct actual filament weight
             const actualWeightTotal = state.filamentWeight || 0;
             const plannedWeightTotal = job.filamentConsumption.reduce((sum, f) => sum + (f.plannedWeight || 0), 0);
             
             const updatedFilamentConsumption = job.filamentConsumption.map(f => {
               // Calculate actual consumed weight proportionally if multiple materials
               let consumed = f.plannedWeight || 0;
               if (actualWeightTotal > 0 && plannedWeightTotal > 0) {
                 consumed = (f.plannedWeight / plannedWeightTotal) * actualWeightTotal;
               } else if (actualWeightTotal > 0 && job.filamentConsumption.length === 1) {
                 consumed = actualWeightTotal;
               }
               
               if (f.materialId && consumed > 0) {
                 updateMaterialWeight(f.materialId, consumed * producedQty);
               }
               
               return { ...f, consumedWeight: consumed };
             });
             
             // Update the job with the exact consumed weight
             updatePrintJob(job.id, {
               filamentConsumption: updatedFilamentConsumption
             });
           }
        }
        delete activeJobsRef.current[printerId];
      }
    } else if (state.status === 'CANCELLED' || state.status === 'ERROR') {
      let jobDbId = currentTrackedJob?.jobDbId;
      
      if (!jobDbId) {
        const existingJob = printJobsRef.current.find(j => 
          j.printerId === printerId && 
          j.fileName === state.filename && 
          (j.status === 'PRINTING' || j.status === 'PAUSED')
        );
        if (existingJob) {
          jobDbId = existingJob.id;
        }
      }

      if (jobDbId) {
        updatePrintJob(jobDbId, {
          status: state.status,
          completedAt: new Date().toISOString(),
          duration: state.timeElapsed,
          progress: state.progress
        });
        delete activeJobsRef.current[printerId];
      }
    }
  };

  useEffect(() => {
    handlePrinterStateChangeRef.current = handlePrinterStateChange;
  });

return (
    <PrinterContext.Provider value={{ activeStates, bridgeOnline, checkBridgeStatus }}>
      {children}
    </PrinterContext.Provider>
  );
};

export const usePrinters = () => {
  const context = useContext(PrinterContext);
  if (!context) throw new Error('usePrinters must be used within PrinterProvider');
  return context;
};
