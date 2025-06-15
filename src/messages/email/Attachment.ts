export class Attachment {
    /**
     * @param name The name of the file.
     * @param path The content of the file.
     * @param type The MIME type of the file.
     */
    constructor(
        private name: string,
        private path: string,
        private type: string,
    ) {}

    public getName(): string {
        return this.name;
    }

    public getPath(): string {
        return this.path;
    }

    public getType(): string {
        return this.type;
    }
}