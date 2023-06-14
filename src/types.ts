export type Message = {
  text: string;
  blocks: Block[];
};

type Block = {
  type: string; //"rich_text";
  block_id: string; //"ZgR";
  elements: Element[];
};

type Element = {
  type: string; //"rich_text_section";
  elements: ElementChild[];
};

type ElementChild = {
  url: string; //"https://zenn.dev/kilinlili/articles/d37c10875410ef",
  type: string; //"text";
  text: string; //"これはテストです。"
};
