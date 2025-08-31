setTimeout(() => {(function() {
  function detectTampermonkeyByScriptInjection() {
      const scripts = document.getElementsByTagName('script');
      for (let script of scripts) {
          if (script.src.includes('tampermonkey')) {
              return true;
          }
      }
      return false;
  }

  function detectTampermonkeyByElement() {
      return document.querySelector('#tampermonkey-specific-element') !== null;
  }

  function detectTampermonkeyByMutation() {
      const targetNode = document.body;
      const config = { childList: true, subtree: true };
      let detected = false;

      const callback = function(mutationsList, observer) {
          for (let mutation of mutationsList) {
              if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach(node => {
                      if (node.nodeType === 1 && node.id === 'tampermonkey-specific-element') {
                          detected = true;
                          observer.disconnect();
                      }
                  });
              }
          }
      };

      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);

      setTimeout(() => observer.disconnect(), 5000);
      return detected;
  }

  if (detectTampermonkeyByScriptInjection()) {
      console.log('Tampermonkey is active (script injection detected)');
  } else if (detectTampermonkeyByElement()) {
      console.log('Tampermonkey is active (specific element detected)');
  } else if (detectTampermonkeyByMutation()) {
      console.log('Tampermonkey is active (mutation detected)');
  } else {
      console.log('Tampermonkey is not active');
  }
})();}, 2500);