export class Attachment {
  /**
   * @param name The name of the file.
   * @param path The content of the file.
   * @param type The MIME type of the file.
   */
  constructor(
    private name: string,
    private path: string | Buffer,
    private type: string,
    private size?: number,
  ) {}

  public getName(): string {
    return this.name;
  }

  public getPath(): string | Buffer {
    return this.path;
  }

  public getType(): string {
    return this.type;
  }

  public async getSize(): Promise<number> {
    if (this.size !== undefined) {
      return this.size;
    }
    if (typeof this.path === "string") {
      const fs = await import("fs/promises");
      const stats = await fs.stat(this.path);
      this.size = stats.size;
      return this.size;
    } else if (Buffer.isBuffer(this.path)) {
      this.size = this.path.length;
      return this.size;
    }
    throw new Error("Size cannot be determined for the provided path type.");
  }

  public async getData(): Promise<Buffer> {
    if (typeof this.path === "string") {
      const fs = await import("fs/promises");
      return fs.readFile(this.path);
    } else if (Buffer.isBuffer(this.path)) {
      return this.path;
    }
    throw new Error("Data cannot be retrieved for the provided path type.");
  }
}
