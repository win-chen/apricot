// Tells typescript that default imports from .sql files are strings
// import mysqlstring from 'mysqlstring.sql'
declare module "*.sql" {
  const content: string;
  export default content;
}
