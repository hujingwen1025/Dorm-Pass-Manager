var isSelf = 0;
const __Reflect_apply = Reflect.apply
const hook = (_class, blacklist, callback) => {
  Object.getOwnPropertyNames(_class).forEach(funcName => {
    if (!blacklist.includes(funcName) && typeof _class[funcName] === 'function') {
      try {
        _class[funcName] = new Proxy(_class[funcName], {
          apply(target, _this, args) {
            if(isSelf === 1) 
              return __Reflect_apply(target, _this, args);

            let stackarr = new Error().stack.split("at ").slice(2);
            if (stackarr.some(stackEntry => stackEntry.includes("dhdgffkkebhmkfjojejmpbldmpobfkfo/userscript.html"))) { 
              callback(target.name)
            }

            isSelf = 1;
            const ret = __Reflect_apply(target, _this, args);
            isSelf = 0;
            return ret;
          }
        });
      } catch {}
    }
  });
};

hook(window, ["alert"], tamperCallback)

function tamperCallback(name) {
  console.log("[monkey-detect] " + name + " was called by a tampermonkey script")
  document.body.innerHTML = "<div style=\"text-align: center;\"><h1>Access Blocked</h1><br><h3>You were blocked by our tamper saftey check. Your browser contains extensions, injections or redirect engines which might put our database at risk. You might need to disable some extensions to regain access (maybe Tampermonkey, Redirecter, Javascript Blocker). If you are unsure, please contact with the chatbox on the bottom right corner.</h3></div>";
}