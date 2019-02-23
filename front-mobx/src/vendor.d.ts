//https://stackoverflow.com/questions/35074713/extending-typescript-global-object-in-node-js
declare module NodeJS  {
  interface Global {
      GitHubComments: any;
  }
}
