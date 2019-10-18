export default class JsonParser {
  index: number = 0;
  json: string = "";
  static numberChars = new Set(["-", "+", "e", "E", "."]);

  constructor() {
    console.log("json解析器");
  }

  parse(json: string): any {
    this.index = 0;
    this.json = json.trim();
    return this.parseJson();
  }

  stringify(obj: any): string | undefined {
    if (Object.prototype.toString.call(obj) === "[object Undefined]") {
      return undefined;
    }
    obj = this.excludeUndefined(obj);
    return this.stringifyJson(obj);
  }

  private excludeUndefined(obj: any): any {
    for (let key of Object.keys(obj)) {
      if (Object.prototype.toString.call(obj[key]) === "[object Undefined]") {
        delete obj[key];
      }
    }
    return obj;
  }

  private stringifyJson(obj: any): string {
    let s = "";
    switch (Object.prototype.toString.call(obj)) {
      case "[object String]":
        s += '"' + obj + '"';
        break;
      case "[object Object]":
        s += "{";
        for (const key of Object.keys(obj)) {
          if (obj.hasOwnProperty(key)) {
            if (s[s.length - 1] !== "{") {
              s += ",";
            }
            s += '"' + key + '":';
            s += this.stringifyJson(obj[key]);
          }
        }
        s += "}";
        break;
      case "[object Array]":
        s += "[";
        for (let element of obj) {
          if (s[s.length - 1] !== "[") {
            s += ",";
          }
          s += this.stringifyJson(element);
        }
        s += "]";
        break;
      case "[object Number]":
      case "[object Boolean]":
      case "[object Null]":
      default:
        s += obj;
    }
    return s;
  }

  private ignoreWhiteSpace(): void {
    while (this.index < this.json.length) {
      if (this.json[this.index] <= " ") {
        this.index++;
      } else {
        break;
      }
    }
  }

  private parseJson(): any {
    this.ignoreWhiteSpace();
    switch (this.json[this.index]) {
      case "{":
        return this.parseObject();
      case "[":
        return this.parseArray();
      case "n":
        return this.parseNull();
      case "t":
        return this.parseTrue();
      case "f":
        return this.parseFalse();
      case '"':
      case "'":
        return this.parseString();
      default:
        return this.parseNumber();
    }
  }

  private parseTrue(): boolean {
    if (this.json.substring(this.index, this.index + 4) === "true") {
      this.index += 4;
      return true;
    } else {
      throw new Error("illegal json string, while parsing true");
    }
  }

  private parseFalse(): boolean {
    if (this.json.substring(this.index, this.index + 5) === "false") {
      this.index += 5;
      return false;
    } else {
      throw new Error("illegal json string, while parsing false");
    }
  }

  private parseNull(): any {
    if (this.json.substring(this.index, this.index + 4) === "null") {
      this.index += 4;
      return null;
    } else {
      throw new Error("illegal json string, while parsing null");
    }
  }

  f(s: string): string {
    console.log(s);
    return String.fromCodePoint(+s);
  }

  // 对unicode字符进行转码
  replacer(match: string, group: RegExp, index: number, all: string): string {
    console.log(match, group, index, all);
    return String.fromCodePoint(+("0x" + group));
  }

  private parseString(): string {
    // 字符串开头是单引号或者双引号
    let quotationMark = this.json[this.index];
    this.index++;
    let begin = this.index;
    for (
      ;
      this.index < this.json.length && this.json[this.index] !== quotationMark;
      this.index++
    ) {
      if (this.json[this.index] === "\\") {
        if (this.json[this.index + 1] === "u") {
          this.index += 5;
        } else {
          this.index++;
        }
      }
    }
    if (this.json[this.index] !== quotationMark) {
      throw new Error("illegal json string, while parsing string");
    }
    let str = this.json.substring(begin, this.index++);
    return str.replace(/\\u(\w{4})/g, this.replacer);
  }

  private parseNumber(): number {
    this.ignoreWhiteSpace();
    let begin = this.index;
    while (
      this.index < this.json.length &&
      this.isNumberChar(this.json[this.index])
    ) {
      this.index++;
    }
    return +this.json.substring(begin, this.index);
  }

  private isNumberChar(c: string): boolean {
    return JsonParser.numberChars.has(c) || (c <= "9" && c >= "0");
  }

  private parseObject(): object {
    this.index++;
    this.ignoreWhiteSpace();
    let dict: any = {};
    while (this.index < this.json.length && this.json[this.index] !== "}") {
      let key = this.parseString();
      this.ignoreWhiteSpace();
      if (this.json[this.index++] !== ":") {
        throw new Error("illegal json string, while parsing :");
      }
      let value = this.parseJson();
      dict[key] = value;
      this.ignoreWhiteSpace();
      if (this.json[this.index] === ",") {
        this.index++;
      }
      this.ignoreWhiteSpace();
    }
    if (this.json[this.index++] !== "}") {
      throw new Error("illegal json string, while parsing object");
    }
    return dict;
  }

  private parseArray(): Array<object> {
    this.index++;
    this.ignoreWhiteSpace();
    let arrayList = new Array<object>();
    while (this.index < this.json.length && this.json[this.index] !== "]") {
      arrayList.push(this.parseJson());
      if (this.json[this.index] === ",") {
        this.index++;
      }
      this.ignoreWhiteSpace();
    }
    if (this.json[this.index++] !== "]") {
      throw new Error("illegal json string, while parsing array");
    }
    return arrayList;
  }
}
