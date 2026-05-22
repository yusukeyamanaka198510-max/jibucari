// CSS ファイルの副作用インポートを TypeScript に認識させる
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
