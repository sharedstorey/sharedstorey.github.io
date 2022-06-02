// Entry point

(() => {
    var acc = document.getElementsByClassName('accordion-header');
    var i;
    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener('click', function() {
        this.classList.toggle('accordion-active');
        const panel = this.nextElementSibling;

        for(let item of document.getElementsByClassName('accordion-active')) {
            if (item !== this) {
                item.classList.toggle('accordion-active');

                const itemPanel = item.nextElementSibling;
                itemPanel.style.maxHeight = null;
            }
        }

        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        } 
      });
    }
})();
