const {
    errorResponse,
} = require('../../helpers/helpers');
const fs = require('fs');

const {
    MANDATORY
} = require('../../helpers/messages');

exports.questionMasterValidate = (req, res, next) => {
    const { question, level, category, optionContentA, optionContentB } = req.body;
    let flag = true;
    let field = '';

    if (!question) {
        flag = false;
        field = 'Question';
    }
    if (!category) {
        flag = false;
        field = 'Category';
    }
    if (!level) {
        flag = false;
        field = 'Level';
    }
    if (optionContentA && optionContentB) {
        if (optionContentA.toLowerCase() === optionContentB.toLowerCase()) {
            flag = false;
        }
    }
    if (flag) {
        return next();
    } else {
        const files = req.files;
        if (files) {
            for (const file of files) {
                fs.unlinkSync(file.path);
            }
        }
        if (!question && !level && !category) {
            return errorResponse(req, res, MANDATORY, 400);
        }
        if (optionContentA && optionContentB) {
            if (optionContentA.toLowerCase() === optionContentB.toLowerCase()) {
                return errorResponse(req, res, `optionContentA and optionContentB same value are not allowed`, 400);
            }
        }
        return errorResponse(req, res, `${field} is mandatory`, 400);
    }
}
