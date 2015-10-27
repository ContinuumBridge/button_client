
bootbox.formModal = function() {

    var options;
    var defaults;
    var dialog;
    var form;
    var input;
    var shouldShow;
    var inputOptions;

    // we have to create our form first otherwise
    // its value is undefined when gearing up our options
    // @TODO this could be solved by allowing message to
    // be a function instead...
    form = $(templates.form);

    // prompt defaults are more complex than others in that
    // users can override more defaults
    // @TODO I don't like that prompt has to do a lot of heavy
    // lifting which mergeDialogOptions can *almost* support already
    // just because of 'value' and 'inputType' - can we refactor?
    defaults = {
        className: "bootbox-prompt",
        buttons: createLabels("cancel", "confirm"),
        value: "",
        inputType: "text"
    };

    options = validateButtons(
        mergeArguments(defaults, arguments, ["title", "callback"]),
        ["cancel", "confirm"]
    );

    console.log('modal options ', options );
    // capture the user's show value; we always set this to false before
    // spawning the dialog to give us a chance to attach some handlers to
    // it, but we need to make sure we respect a preference not to show it
    shouldShow = (options.show === undefined) ? true : options.show;

    /**
     * overrides; undo anything the user tried to set they shouldn't have
     */
    options.message = form;

    options.buttons.cancel.callback = options.onEscape = function() {
        return options.callback.call(this, null);
    };

    options.buttons.confirm.callback = function() {
        var value;

        /*

        */
        console.log('options.inputs', options.fields);
        var attributes = _.object(_.map(options.fields, function(fieldType, fieldName) {
            //console.log('input', input, inputType);

            switch (fieldType) {
                case "text":
                case "textarea":
                case "email":
                case "select":
                case "date":
                case "time":
                case "number":
                case "password":
                    return [fieldName, input.find('.' + fieldName).val()];
                    break;

                case "checkbox":
                    var checkbox = input.find('.' + fieldName);
                    console.log('checkbox ', checkbox );
                    console.log('checkbox.checked', checkbox.checked);
                    return [fieldName, checkbox.checked];
                    break;
            }
        }));
        console.log('attributes ', attributes );
        //console.log('submit input', input);
        //console.log('submit input', input.find('.id'));

        return options.callback.call(this, attributes);
    };

    options.show = false;

    // prompt specific validation
    if (!options.title) {
        throw new Error("prompt requires a title");
    }

    if (!$.isFunction(options.callback)) {
        throw new Error("prompt requires a callback");
    }

    if (!templates.inputs[options.inputType]) {
        throw new Error("invalid prompt type");
    }

    // create the input based on the supplied type
    //input = $(templates.inputs[options.inputType]);
    input = $(options.value);

    /*
    switch (options.inputType) {
        case "text":
        case "textarea":
        case "email":
        case "date":
        case "time":
        case "number":
        case "password":
            input.val(options.value);
            break;
    }
    */

    // @TODO provide an attributes option instead
    // and simply map that as keys: vals
    if (options.placeholder) {
        input.attr("placeholder", options.placeholder);
    }

    if (options.pattern) {
        input.attr("pattern", options.pattern);
    }

    if (options.maxlength) {
        input.attr("maxlength", options.maxlength);
    }

    // now place it in our form
    form.append(input);

    form.on("submit", function(e) {
        e.preventDefault();
        // Fix for SammyJS (or similar JS routing library) hijacking the form post.
        e.stopPropagation();
        // @TODO can we actually click *the* button object instead?
        // e.g. buttons.confirm.click() or similar
        dialog.find(".btn-primary").click();
    });

    dialog = bootbox.dialog(options);

    // clear the existing handler focusing the submit button...
    dialog.off("shown.bs.modal");

    // ...and replace it with one focusing our input, if possible
    /*
    dialog.on("shown.bs.modal", function() {
        // need the closure here since input isn't
        // an object otherwise
        input.focus();
    });
    */

    if (shouldShow === true) {
        dialog.modal("show");
    }

    return dialog;
};

var defaults = {
    // default language
    locale: "en",
    // show backdrop or not. Default to static so user has to interact with dialog
    backdrop: "static",
    // animate the modal in/out
    animate: true,
    // additional class string applied to the top level dialog
    className: null,
    // whether or not to include a close button
    closeButton: true,
    // show the dialog immediately by default
    show: true,
    // dialog container
    container: "body"
};

var locales = {
    ar : {
        OK      : "موافق",
        CANCEL  : "الغاء",
        CONFIRM : "تأكيد"
    },
    bg_BG : {
        OK      : "Ок",
        CANCEL  : "Отказ",
        CONFIRM : "Потвърждавам"
    },
    br : {
        OK      : "OK",
        CANCEL  : "Cancelar",
        CONFIRM : "Sim"
    },
    cs : {
        OK      : "OK",
        CANCEL  : "Zrušit",
        CONFIRM : "Potvrdit"
    },
    da : {
        OK      : "OK",
        CANCEL  : "Annuller",
        CONFIRM : "Accepter"
    },
    de : {
        OK      : "OK",
        CANCEL  : "Abbrechen",
        CONFIRM : "Akzeptieren"
    },
    el : {
        OK      : "Εντάξει",
        CANCEL  : "Ακύρωση",
        CONFIRM : "Επιβεβαίωση"
    },
    en : {
        OK      : "OK",
        CANCEL  : "Cancel",
        CONFIRM : "OK"
    },
    es : {
        OK      : "OK",
        CANCEL  : "Cancelar",
        CONFIRM : "Aceptar"
    },
    et : {
        OK      : "OK",
        CANCEL  : "Katkesta",
        CONFIRM : "OK"
    },
    fa : {
        OK      : "قبول",
        CANCEL  : "لغو",
        CONFIRM : "تایید"
    },
    fi : {
        OK      : "OK",
        CANCEL  : "Peruuta",
        CONFIRM : "OK"
    },
    fr : {
        OK      : "OK",
        CANCEL  : "Annuler",
        CONFIRM : "D'accord"
    },
    he : {
        OK      : "אישור",
        CANCEL  : "ביטול",
        CONFIRM : "אישור"
    },
    hu : {
        OK      : "OK",
        CANCEL  : "Mégsem",
        CONFIRM : "Megerősít"
    },
    hr : {
        OK      : "OK",
        CANCEL  : "Odustani",
        CONFIRM : "Potvrdi"
    },
    id : {
        OK      : "OK",
        CANCEL  : "Batal",
        CONFIRM : "OK"
    },
    it : {
        OK      : "OK",
        CANCEL  : "Annulla",
        CONFIRM : "Conferma"
    },
    ja : {
        OK      : "OK",
        CANCEL  : "キャンセル",
        CONFIRM : "確認"
    },
    lt : {
        OK      : "Gerai",
        CANCEL  : "Atšaukti",
        CONFIRM : "Patvirtinti"
    },
    lv : {
        OK      : "Labi",
        CANCEL  : "Atcelt",
        CONFIRM : "Apstiprināt"
    },
    nl : {
        OK      : "OK",
        CANCEL  : "Annuleren",
        CONFIRM : "Accepteren"
    },
    no : {
        OK      : "OK",
        CANCEL  : "Avbryt",
        CONFIRM : "OK"
    },
    pl : {
        OK      : "OK",
        CANCEL  : "Anuluj",
        CONFIRM : "Potwierdź"
    },
    pt : {
        OK      : "OK",
        CANCEL  : "Cancelar",
        CONFIRM : "Confirmar"
    },
    ru : {
        OK      : "OK",
        CANCEL  : "Отмена",
        CONFIRM : "Применить"
    },
    sq : {
        OK : "OK",
        CANCEL : "Anulo",
        CONFIRM : "Prano"
    },
    sv : {
        OK      : "OK",
        CANCEL  : "Avbryt",
        CONFIRM : "OK"
    },
    th : {
        OK      : "ตกลง",
        CANCEL  : "ยกเลิก",
        CONFIRM : "ยืนยัน"
    },
    tr : {
        OK      : "Tamam",
        CANCEL  : "İptal",
        CONFIRM : "Onayla"
    },
    zh_CN : {
        OK      : "OK",
        CANCEL  : "取消",
        CONFIRM : "确认"
    },
    zh_TW : {
        OK      : "OK",
        CANCEL  : "取消",
        CONFIRM : "確認"
    }
};

/**
 * from a given list of arguments return a suitable object of button labels
 * all this does is normalise the given labels and translate them where possible
 * e.g. "ok", "confirm" -> { ok: "OK, cancel: "Annuleren" }
 */
function createLabels() {
    var buttons = {};

    for (var i = 0, j = arguments.length; i < j; i++) {
        var argument = arguments[i];
        var key = argument.toLowerCase();
        var value = argument.toUpperCase();

        buttons[key] = {
            label: _t(value)
        };
    }

    return buttons;
}

function validateButtons(options, buttons) {
    var allowedButtons = {};
    each(buttons, function(key, value) {
        allowedButtons[value] = true;
    });

    each(options.buttons, function(key) {
        if (allowedButtons[key] === undefined) {
            throw new Error("button key " + key + " is not allowed (options are " + buttons.join("\n") + ")");
        }
    });

    return options;
}

function _t(key) {
    var locale = locales[defaults.locale];
    return locale ? locale[key] : locales.en[key];
}

/**
 * merge a set of default dialog options with user supplied arguments
 */
function mergeArguments(defaults, args, properties) {
    return $.extend(
        // deep merge
        true,
        // ensure the target is an empty, unreferenced object
        {},
        // the base options object for this type of dialog (often just buttons)
        defaults,
        // args could be an object or array; if it's an array properties will
        // map it to a proper options object
        mapArguments(
            args,
            properties
        )
    );
}

var templates = {
    dialog:
    "<div class='bootbox modal' tabindex='-1' role='dialog'>" +
    "<div class='modal-dialog'>" +
    "<div class='modal-content'>" +
    "<div class='modal-body'><div class='bootbox-body'></div></div>" +
    "</div>" +
    "</div>" +
    "</div>",
    header:
    "<div class='modal-header'>" +
    "<h4 class='modal-title'></h4>" +
    "</div>",
    footer:
        "<div class='modal-footer'></div>",
    closeButton:
        "<button type='button' class='bootbox-close-button close' data-dismiss='modal' aria-hidden='true'>&times;</button>",
    form:
        "<form class='bootbox-form'></form>",
    inputs: {
        text:
            "<input class='bootbox-input bootbox-input-text form-control' autocomplete=off type=text />",
        textarea:
            "<textarea class='bootbox-input bootbox-input-textarea form-control'></textarea>",
        email:
            "<input class='bootbox-input bootbox-input-email form-control' autocomplete='off' type='email' />",
        select:
            "<select class='bootbox-input bootbox-input-select form-control'></select>",
        checkbox:
            "<div class='checkbox'><label><input class='bootbox-input bootbox-input-checkbox' type='checkbox' /></label></div>",
        date:
            "<input class='bootbox-input bootbox-input-date form-control' autocomplete=off type='date' />",
        time:
            "<input class='bootbox-input bootbox-input-time form-control' autocomplete=off type='time' />",
        number:
            "<input class='bootbox-input bootbox-input-number form-control' autocomplete=off type='number' />",
        password:
            "<input class='bootbox-input bootbox-input-password form-control' autocomplete='off' type='password' />"
    }
};

/**
 * map a flexible set of arguments into a single returned object
 * if args.length is already one just return it, otherwise
 * use the properties argument to map the unnamed args to
 * object properties
 * so in the latter case:
 * mapArguments(["foo", $.noop], ["message", "callback"])
 * -> { message: "foo", callback: $.noop }
 */
function mapArguments(args, properties) {
    var argn = args.length;
    var options = {};

    if (argn < 1 || argn > 2) {
        throw new Error("Invalid argument length");
    }

    if (argn === 2 || typeof args[0] === "string") {
        options[properties[0]] = args[0];
        options[properties[1]] = args[1];
    } else {
        options = args[0];
    }

    return options;
}

function each(collection, iterator) {
    var index = 0;
    $.each(collection, function(key, value) {
        iterator(key, value, index++);
    });
}
