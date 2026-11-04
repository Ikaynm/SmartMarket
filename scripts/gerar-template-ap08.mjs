import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  BorderStyle,
} from "docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "AP08-SmartMarket-Relatorio-Template.docx");

const placeholder = () =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "[ Cole o print aqui: Inserir → Imagens ]",
                    italics: true,
                    color: "999999",
                  }),
                ],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            },
          }),
        ],
      }),
    ],
  });

const cell = (text, bold = false) =>
  new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
  });

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          heading: HeadingLevel.TITLE,
          children: [new TextRun({ text: "SmartMarket", bold: true, size: 56 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Aplicativo de Lista de Compras", bold: true, size: 32 })],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Atividade: AP08 — Desenvolvimento de Aplicações Móveis",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Instituição: [ NOME DA INSTITUIÇÃO ]" })],
        }),
        new Paragraph({ text: "" }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [cell("Aluno:", true), cell("Caio Martins")] }),
            new TableRow({
              children: [cell("Curso:", true), cell("Sistemas de Informação — 6º período")],
            }),
            new TableRow({
              children: [cell("Disciplina:", true), cell("Desenvolvimento de Aplicações Móveis")],
            }),
            new TableRow({ children: [cell("Data de entrega:", true), cell("[ DD/MM/AAAA ]")] }),
          ],
        }),

        new Paragraph({ text: "", pageBreakBefore: true }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Introdução")] }),
        new Paragraph({
          children: [
            new TextRun(
              "Este documento apresenta o aplicativo SmartMarket, desenvolvido em React Native (Expo) com Firebase Authentication e Cloud Firestore, conforme a atividade AP08. Descreva em 1–2 parágrafos o objetivo do app e o problema que ele resolve.",
            ),
          ],
        }),
        new Paragraph({
          children: [new TextRun({ text: "[ Escreva sua introdução aqui ]", italics: true })],
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Tecnologias utilizadas")] }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [cell("Tecnologia / Ferramenta", true), cell("Finalidade no projeto", true)],
            }),
            ...[
              ["React Native + Expo", "Interface mobile multiplataforma"],
              ["TypeScript", "Tipagem e organização do código"],
              ["Firebase Authentication", "Login, cadastro e recuperação de senha"],
              ["Cloud Firestore", "Armazenamento das listas e produtos na nuvem"],
              ["Expo Go / Web", "Execução e testes no dispositivo ou navegador"],
            ].map(
              ([a, b]) => new TableRow({ children: [cell(a), cell(b)] }),
            ),
          ],
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Atendimento aos requisitos da AP08")] }),
        new Paragraph({
          children: [new TextRun("Confira e ajuste a coluna “Implementado?” se necessário.")],
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                cell("Requisito (enunciado)", true),
                cell("Implementado?", true),
                cell("Onde / observação", true),
              ],
            }),
            ...[
              ["Login com e-mail e senha (Firebase Auth)", "Sim", "AuthScreen"],
              ["Recuperação de senha por e-mail", "Sim", "Tela de login"],
              ["Cadastro de produtos (nome, qtd, preço)", "Sim", "ProductsScreen"],
              ["Campo dataAdicao automático (timestamp)", "Sim", "serverTimestamp()"],
              ["Editar e excluir produtos", "Sim", "ProductsScreen"],
              ["Total por produto (qtd × preço)", "Sim", "Tela de produtos"],
              ["Total geral da lista em tempo real", "Sim", "onSnapshot"],
              ["Dados persistidos no Firestore", "Sim", "usuarios/{uid}/listas/..."],
              ["Tela de login", "Sim", ""],
              ["Tela de recuperação de senha", "Sim", ""],
              ["Tela de produtos da lista", "Sim", ""],
              ["Exibição do total geral", "Sim", ""],
              ["EXTRA: marcar produtos como comprados", "Sim", "Destaque visual"],
              ["EXTRA: resumo da compra", "Sim", "Quantidade e gasto total"],
            ].map(
              ([a, b, c]) =>
                new TableRow({ children: [cell(a), cell(b), cell(c)] }),
            ),
          ],
        }),

        new Paragraph({ text: "", pageBreakBefore: true }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Evidências (prints de tela)")] }),
        new Paragraph({
          children: [
            new TextRun(
              "Insira capturas legíveis. No Word: Inserir → Imagens → Este dispositivo.",
            ),
          ],
        }),

        ...[
          ["4.1 Tela de login e cadastro", "Login, cadastro e campos de e-mail/senha."],
          ["4.2 Recuperação de senha", "Fluxo “Esqueceu sua senha?” e confirmação."],
          ["4.3 Listas de compras", "Tela de listas."],
          ["4.4 Produtos da lista", "Nome, quantidade e preço unitário."],
          ["4.5 Totais em tempo real", "Subtotal por item e total geral."],
          ["4.6 Desafio extra — comprados e resumo", "Itens comprados + resumo."],
          ["4.7 Firebase Firestore (opcional)", "Console Firestore com os dados salvos."],
        ].flatMap(([title, hint]) => [
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(title)] }),
          new Paragraph({ children: [new TextRun(hint)] }),
          placeholder(),
          new Paragraph({ text: "" }),
        ]),

        new Paragraph({ text: "", pageBreakBefore: true }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Como executar o projeto")] }),
        ...[
          "Instalar Node.js 22+ e abrir a pasta SmartMarket.",
          "Firebase: Auth (e-mail/senha) + Firestore; publicar firestore.rules.",
          "Copiar .env.example para .env e preencher EXPO_PUBLIC_FIREBASE_*.",
          "npm install",
          "npx expo start (Expo Go) ou npx expo start --web",
        ].map(
          (t, i) =>
            new Paragraph({
              children: [new TextRun(`${i + 1}. ${t}`)],
            }),
        ),
        new Paragraph({
          children: [
            new TextRun({
              text: "URL do repositório ou vídeo de demonstração: [ COLE O LINK ]",
              italics: true,
            }),
          ],
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Conclusão")] }),
        new Paragraph({
          children: [new TextRun({ text: "[ O que você aprendeu; melhorias futuras ]", italics: true })],
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Referências")] }),
        ...[
          "Documentação Expo — https://docs.expo.dev/",
          "Firebase Authentication — https://firebase.google.com/docs/auth",
          "Cloud Firestore — https://firebase.google.com/docs/firestore",
        ].map((t) => new Paragraph({ children: [new TextRun(`• ${t}`)] })),

        new Paragraph({ text: "" }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun("— Fim do relatório —")],
        }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(out, buffer);
console.log("Arquivo gerado:", out);
