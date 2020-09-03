export class TransformError {
  constructor(readonly filename: string, readonly pos: Position, readonly message: string) {}

  toString(): string {
    return `${this.filename}:${this.pos.start.line}:${this.pos.start.col} - ${this.message}`;
  }
}

interface Position {
  start: Location;
  end: Location;
}

interface Location {
  line: number;
  col: number;
}
