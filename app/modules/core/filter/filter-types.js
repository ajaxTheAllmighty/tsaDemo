'use strict';
module.exports = function () {
    function getFilterCondition(type){
        switch(type){
            case 'INT':
                return [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'more', 'text':t('conditionMore', 'FilterModule')},
                    {'name':'less', 'text':t('conditionLess', 'FilterModule')},
                    {'name':'moreOrEqual', 'text':t('conditionMoreOrEqual', 'FilterModule')},
                    {'name':'lessOrEqual', 'text':t('conditionLessOrEqual', 'FilterModule')},
                    {'name':'list', 'text':t('conditionList', 'FilterModule')}
                ]
                break;
            case 'NUM':
                return [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'more', 'text':t('conditionMore', 'FilterModule')},
                    {'name':'less', 'text':t('conditionLess', 'FilterModule')},
                    {'name':'moreOrEqual', 'text':t('conditionMoreOrEqual', 'FilterModule')},
                    {'name':'lessOrEqual', 'text':t('conditionLessOrEqual', 'FilterModule')},
                    {'name':'list', 'text':t('conditionList', 'FilterModule')}
                ]
                break;
            case 'CHK':
                return [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')}
                ]
                break;
            case 'TEXT':
                return [
                    {'name':'like', 'text':t('conditionLike', 'FilterModule')},
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'likeStart', 'text':t('conditionLikeStart', 'FilterModule')},
                    {'name':'null', 'text':t('conditionNull', 'FilterModule')},
                    {'name':'notNull', 'text':t('conditionNotNull', 'FilterModule')},
                    {'name':'list', 'text':t('conditionList', 'FilterModule')}
                ]
                break;
            case 'LIST':
                return [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'notEqual', 'text':t('conditionNotEqual', 'FilterModule')},
                    {'name':'null', 'text':t('conditionNull', 'FilterModule')},
                    {'name':'notNull', 'text':t('conditionNotNull', 'FilterModule')}
                ]
                break;
            case 'GRD':
                return [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'notEqual', 'text':t('conditionNotEqual', 'FilterModule')},
                    {'name':'null', 'text':t('conditionNull', 'FilterModule')},
                    {'name':'notNull', 'text':t('conditionNotNull', 'FilterModule')}
                ]
                break;
            case 'SNGL':
                return [
                    {'name':'equal', 'text':t('conditionEqual', 'FilterModule')},
                    {'name':'more', 'text':t('conditionMore', 'FilterModule')},
                    {'name':'less', 'text':t('conditionLess', 'FilterModule')},
                    {'name':'moreOrEqual', 'text':t('conditionMoreOrEqual', 'FilterModule')},
                    {'name':'lessOrEqual', 'text':t('conditionLessOrEqual', 'FilterModule')}
                ]
                break;
            case 'DATE':
                return [
                    {'name':'between', 'text':t('conditionBetween', 'FilterModule')}
                ]
                break;
            default:
                return [
                    {'name':'unknown', 'text':'unknown type of filter "'+type+'"!'}
                ]
                console.error('unknown type of filter!');
                break;
        }
    }

    return {
        getFilterCondition: getFilterCondition
    }
};