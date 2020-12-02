const fs = require("fs");
const path = require("path");
const rmdir = require("rmdir");
const { exec } = require("child_process");
const r = require("dotenv").config({
  path: path.join(__dirname, "ambiente.env"),
});

if (r.error) {
  throw r.error;
}
const ROOT = __dirname;
const BUILD_DIR = path.join(ROOT, "dist");
const ELECTRON_APP_BUILD = path.join(ROOT, "src", "build");
const ELECTRON_APP_OBFUSCADO = path.join(ELECTRON_APP_BUILD, "obfuscado");
const JS_DIR = path.join(ROOT, "public", "js");

function excluirDir(dir, cb) {
  let remover = true;
  if (!fs.existsSync(dir)) {
    cb();
    remover = false;
  }

  if (remover) {
    rmdir(dir, function (err) {
      if (err) {
        console.log(err);
        return;
      }

      try {
        fs.rmdirSync(dir);
      } catch (err) {}
      console.log(`>Criando novo diretório ${path.basename(dir)}`);
      fs.mkdirSync(dir);
      cb();
    });
  }
}

function build(cb) {
  console.info("Limpando builds anteriores...");
  console.info(`process.env.NODE_ENV = ${process.env.NODE_ENV}`);

  // FIX-LATER CALLBACK HELL
  excluirDir(BUILD_DIR, () => {
    excluirDir(ELECTRON_APP_BUILD, () => {
        excluirDir(JS_DIR, prosseguir.bind(this, cb));
    });
  });
}

function prosseguir(cb) {
  const construirApp = () => {
    const acao = process.env.NODE_ENV === "production" ? "ap:dist" : "ap:pack";
    const buildTask = exec("npm run ".concat(acao));
    buildTask.once("exit", () => cb());
  };

  // compila os arquivos .ts referentes ao app electron
  console.info("Compilando o app electron (typescript)...");
  const buildTsc = exec("npm run app:compile");
  buildTsc.once("exit", () => {
    const logOut =
      process.env.NODE_ENV === "production"
        ? "Criando arquivo de setup em dist/ !! env produção !!"
        : 'Criando pacote do executável em dist/!!(process.env.NODE_ENV === "development"';
    console.log(logOut);

    console.info("Construindo app...");
    exec("npm run app:build", construirApp);
  });
}

exports.default = build;
