(async () => {
  require("./express");
})().then(() => {
  (async () => {
    require("./mongoose");
  })().then(() => {
    // require('./scheduler')
  });
});
