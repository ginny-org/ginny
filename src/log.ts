import * as ansi from "ansi";
import * as readline from "readline";

let numTotal = 0;
let numProcessed = 0;
let started = 0;
let silenced = false;

const cursor = ansi(process.stdout);

export function silence(silent: boolean): void {
  silenced = silent;
}

export function start(): void {
  if (silenced) {
    return;
  }

  numTotal = 0;
  numProcessed = 0;
  started = Date.now();

  cursor
    .hide()
    .write("\n")
    .bold()
    .write("[")
    .yellow()
    .write(t())
    .reset()
    .bold()
    .write("]")
    .reset()
    .blue()
    .write(" Started")
    .reset()
    .write(" build\n")
    .reset();
}

export function prepare(filename: string): void {
  numTotal++;
  update(filename);
}

export function processed(filename: string): void {
  numProcessed++;
  update(filename);
}

function beginLine(): ansi.Cursor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const horizontalAbsolute = cursor.horizontalAbsolute as any;
  horizontalAbsolute.call(cursor, 0);
  return cursor;
}

export function error(message: string): void {
  if (silenced) {
    return;
  }

  cursor.red().bold().write("ERROR").reset().write(" - ").write(message).write("\n");
}

export function finish(): void {
  if (silenced) {
    return;
  }

  const elapsedSeconds = ((Date.now() - started) / 1000).toFixed(1);

  beginLine()
    .eraseLine()
    .bold()
    .write("[")
    .yellow()
    .write(t())
    .reset()
    .bold()
    .write("]")
    .reset()
    .green()
    .write(" Done")
    .reset()
    .write(", processed ")
    .bold()
    .write(`${numTotal}`)
    .reset()
    .write(` file${numTotal !== 1 ? "s" : ""} in `)
    .bold()
    .write(elapsedSeconds)
    .reset()
    .write(" seconds.\n\n")
    .show();

  readline.clearLine(process.stdout, 1);
}

function update(filename: string): void {
  if (!process.stdout.isTTY || silenced) {
    return;
  }

  const progress = (numTotal ? (numProcessed / numTotal) * 100 : 0).toFixed(0).padStart(3);

  beginLine()
    .bold()
    .write("[")
    .yellow()
    .write(t())
    .reset()
    .bold()
    .write("]")
    .reset()
    .write(" [")
    .green()
    .write(`${progress}%`)
    .reset()
    .bold()
    .write("]")
    .reset()
    .write(` ${filename}`);

  readline.clearLine(process.stdout, 1);
}

function t(): string {
  return new Date().toLocaleTimeString("fr");
}
