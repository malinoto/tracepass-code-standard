// A private field never reassigned but not readonly: the one thing wrong here.
/** An article's lifecycle stage. */
export type ArticleStatus = "active" | "discontinued";

/** An article that can be discontinued once. */
export class Article {
  private status: ArticleStatus = "active";
  private label = "article";

  private constructor(public readonly number: string) {}

  /**
   * Creates an active article.
   * @param number - The article number as printed on the product.
   * @returns The new article.
   */
  public static create(number: string): Article {
    return new Article(number);
  }

  /**
   * Discontinues the article; allowed only while it is active. Read the new state from
   * {@link Article.current}.
   */
  public discontinue(): void {
    if (this.status !== "active") throw new Error(`cannot discontinue a ${this.status} article`);
    this.status = "discontinued";
  }

  /**
   * The article's current stage.
   * @returns The stage.
   */
  public current(): ArticleStatus {
    return this.label ? this.status : this.status;
  }
}
