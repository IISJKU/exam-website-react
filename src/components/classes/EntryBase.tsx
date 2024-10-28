export default abstract class EntryBase {
  abstract getName(): string;

  toString(): string {
    return this.getName();
  }
}
