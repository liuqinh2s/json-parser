import JsonParser from "./jsonParser";
import json from "./china.json";

let jsonParser = new JsonParser();

// 测试 unicode 转码
// let str = jsonParser.stringify(json);
// let str = '["\\u89E3\\u6790\\u5668"]';
// let obj = jsonParser.parse(str);

// 测试undefined
let a;
let obj = { k: a, kk: "h" };
console.log(JSON.stringify(a));
console.log(jsonParser.stringify(a));
console.log(JSON.stringify(obj));
console.log(jsonParser.stringify(obj));
