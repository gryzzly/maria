maria.ElementView = function(model, controller, doc) {
    this._doc = doc || document;
    maria.View.call(this, model, controller);
};

maria.ElementView.prototype = new maria.View();
maria.ElementView.prototype.constructor = maria.ElementView;

maria.ElementView.prototype.getDocument = function() {
    return this._doc;
};

maria.ElementView.prototype.getTemplate = function() {
    return '<div></div>';
};

maria.ElementView.prototype.getUIActions = function() {
    return {};
};

(function() {
    var actionRegExp = /^(\S+)\s*(.*)$/;

    maria.ElementView.prototype.getRootEl = function() {
        if (!this._rootEl) {
            // parseHTML returns a DocumentFragment so take firstChild as the rootEl
            var rootEl = this._rootEl = maria.parseHTML(this.getTemplate(), this._doc).firstChild;

            var uiActions = this.getUIActions();
            for (var key in uiActions) {
                if (Object.prototype.hasOwnProperty.call(uiActions, key)) {
                    var matches = key.match(actionRegExp),
                        eventType = matches[1],
                        selector = matches[2],
                        methodName = uiActions[key],
                        elements = maria.findAll(selector, this._rootEl);
                    for (var i = 0, ilen = elements.length; i < ilen; i++) {
                        evento.addEventListener(elements[i], eventType, this, methodName);
                    }
                }
            }

            var childViews = this.childNodes;
            for (var i = 0, ilen = childViews.length; i < ilen; i++) {
                this.getContainerEl().appendChild(childViews[i].getRootEl());
            }

            this.update();
        }
        return this._rootEl;
    };

}());

maria.ElementView.prototype.getContainerEl = function() {
    return this.getRootEl();
};

maria.ElementView.prototype.insertBefore = function(newChild, oldChild) {
    maria.View.prototype.insertBefore.call(this, newChild, oldChild);
    if (this._rootEl) {
        this.getContainerEl().insertBefore(newChild.getRootEl(), oldChild ? oldChild.getRootEl() : null);
    }
};

maria.ElementView.prototype.removeChild = function(oldChild) {
    maria.View.prototype.removeChild.call(this, oldChild);
    if (this._rootEl) {
        this.getContainerEl().removeChild(oldChild.getRootEl());
    }
};

maria.ElementView.prototype.find = function(selector) {
    return maria.find(selector, this.getRootEl());
};

maria.ElementView.prototype.findAll = function(selector) {
    return maria.findAll(selector, this.getRootEl());
};


maria.ElementView.subclass = function(namespace, name, options) {
    options = options || {};
    options.SuperConstructor = options.SuperConstructor || maria.ElementView;
    var template = options.template;
    var uiActions = options.uiActions;
    var methods = options.methods || (options.methods = {});
    if (template && !methods.getTemplate) {
        methods.getTemplate = function() {
            return template;
        };
    }
    if (uiActions) {
        if (!methods.getUIActions) {
            methods.getUIActions = function() {
                return uiActions;
            };
        }
        for (var key in uiActions) {
            if (Object.prototype.hasOwnProperty.call(uiActions, key)) {
                var methodName = uiActions[key];
                if (!methods[methodName]) {
                    (function(methodName) {
                        methods[methodName] = function(evt) {
                            this.getController()[methodName](evt);
                        };
                    }(methodName));
                }
            }
        }
    }
    maria.View.subclass(namespace, name, options);
};
