# ReSTAR-AI-ts

小説執筆アプリである[novelaid-editor](https://github.com/mituha/novelaid-editor)の生成AI使用部分をライブラリ化するためのものです。  

現状、複数のプロジェクトでAI機能を利用していますが、個々で似通った実装を行っています。  
そこで、それらをまとめて同じように使用できるライブラリとして用意するものとします。

## 要件

基本的には自分で利用する可能性のあるAIが使用できれば良いものとします。

* Gemini(google)
* OpenAI
* LM Studio
    + ローカル用

これらを切り替えても同じように使用できるライブラリを用意します。  
また、設定部分もある程度共通化するのが目的です。







## 開発環境


## ドキュメント

```
npm install -D typedoc
npx typedoc --entryPoints src/index.ts --out docs
```



