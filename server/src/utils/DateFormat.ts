export class DateFormat {
  private static pad(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }

  static formatDate(d: Date): string {
    const day = this.pad(d.getDate());
    const month = this.pad(d.getMonth() + 1);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  static toSqlDate(d: Date): string {
    const month = this.pad(d.getMonth() + 1);
    const day = this.pad(d.getDate());
    return `${d.getFullYear()}-${month}-${day}`;
  }
}
