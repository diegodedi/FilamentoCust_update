# Regra de Conteúdo da Central de Ajuda & Changelog (Foco 100% no Usuário Final)

**CRITICAL RULE: A Central de Ajuda, o Manual e o Histórico de Versões são EXCLUSIVAMENTE para o usuário final, nunca para anotações técnicas de desenvolvimento.**

---

## 1. Diretriz Principal
O Help (`HelpCenterModal`), a Base de Conhecimento (`documentationData.ts`), o Histórico de Versões (`changelogData.ts`) e o modal "O Que Há de Novo" (`WhatsNewModal`) existem para orientar o **dono de gráfica/oficina 3D**, cliente ou operador do app.

Portanto:
- **Toda comunicação deve ser focada em funcionalidade, valor de negócio e usabilidade.**
- **NENHUM detalhe técnico interno ou de refatoração deve constar no Help.**

---

## 2. O Que é ESTRITAMENTE PROIBIDO no Help e Changelog
❌ **Termos de Refatoração e Código:**
- "Refatoração modular", "componentização", "modularização atômica", "split de arquivos", "código limpo", "GOLDCODE", "Clean Code".
- "Desacoplamento", "camadas de serviço", "arquitetura limpa".

❌ **Nomes Técnicos de Arquivos e Código:**
- Extensões e caminhos: `.tsx`, `.ts`, `src/components/...`, `App.tsx`, `MaterialCard.tsx`, etc.
- Nomes de hooks, contexts ou funções: `useDb`, `DbContext`, `PrinterContext`, `useState`, `useEffect`.
- Bibliotecas e ferramentas de desenvolvimento: Vite, TypeScript, Tailwind, Lucide, Electron-builder, NPM.

---

## 3. O Que DEVE Constar no Help e Changelog
✅ **Novidades Reais de Uso (O que o usuário consegue ver ou clicar):**
- Novas telas, novas abas, novos botões ou novas configurações.
- Novas regras de cálculo explicadas de forma prática (ex: *Regra dos R$ 79 do Mercado Livre*, *Margem Líquida B2C vs B2B*, *Peso da caixa de envio*).

✅ **Melhorias de Experiência e Performance:**
- Telas mais rápidas, layout mais limpo e responsivo, melhor visibilidade de cores e contrastes.
- Correções de comportamentos ou travamentos que afetavam a operação do usuário.

✅ **Exemplos do Mundo Real:**
- Simulações de peças 3D reais (ex: *Suporte Headset de 80g em PLA*, *Action Figure de 270g*).

---

## 4. Checklist Obrigatório ao Criar Nova Versão
Antes de registrar qualquer item em `src/data/changelogData.ts`:
- [ ] Um cliente ou operador entenderia essa linha sem precisar saber programar?
- [ ] A palavra "refatoração", "modular" ou nomes de arquivos `.tsx` foram 100% eliminados?
- [ ] O texto explica o benefício prático que o usuário ganhou na aplicação?
