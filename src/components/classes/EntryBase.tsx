export default abstract class EntryBase {
  abstract getName(): string;
  abstract id: number;

  toString(): string {
    return this.getName();
  }
}
