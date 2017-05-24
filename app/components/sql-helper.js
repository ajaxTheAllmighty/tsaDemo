'use strict';
module.exports = function () {
    function getFilterConditions(){
        return {
            equal: {'condition':'equal', text: t('conditionEqual', 'GridModule')},
            more: {'condition':'more', text: t('conditionMore', 'GridModule')},
            less: {'condition':'less', text: t('conditionLess', 'GridModule')},
            moreOrEqual: {'condition':'moreOrEqual', text: t('conditionMoreOrEqual', 'GridModule')},
            lessOrEqual: {'condition':'lessOrEqual', text: t('conditionLessOrEqual', 'GridModule')},
            likeStart: {'condition':'likeStart', text: t('conditionLikeStart', 'GridModule')},
            like: {'condition':'like', text: t('conditionLike', 'GridModule')},
            notEqual: {'condition':'notEqual', text: t('conditionNotEqual', 'GridModule')},
            null: {'condition':'null', text: t('conditionNull', 'GridModule')},
            notNull: {'condition':'notNull', text: t('conditionNotNull', 'GridModule')},
            between: {'condition':'between', text: t('conditionBetween', 'GridModule')},
            list: {'condition':'between', text: t('conditionList', 'GridModule')}
        }
    }

    var keyGridFilterConditions = getFilterConditions();
    keyGridFilterConditions['in'] = {'condition':'in', text: ''};
    keyGridFilterConditions['notIn'] = {'condition':'notIn', text: ''};

    function buildCondition($filter){
        var query = '';
        var condition = '';
        var value = $filter.value;
        var type = $filter.type;
        var conditionArray = {
            "equal":" = {value}",
            "more":" > {value}",
            "less":" < {value}",
            "moreOrEqual":" >= {value}",
            "lessOrEqual":" <= {value}",
            "likeStart":" LIKE {value}%",
            "like":" LIKE %{value}%",
            "null":" IS NULL",
            "notNull":" IS NOT NULL",
            "notEqual":" <> {value}",
            "between" : " BETWEEN {value1} AND {value2}",
            "list" : " IN ({value})",
            "in" : " IN ({value})",
            "notIn" : " NOT IN ({value})"
        };
        var conditionArrayWithQuotes = {
            "equal":" = '{value}'",
            "more":" > '{value}'",
            "less":" < '{value}'",
            "moreOrEqual":" >= '{value}'",
            "lessOrEqual":" <= '{value}'",
            "likeStart":" LIKE '{value}%'",
            "like":" LIKE '%{value}%'",
            "null":" IS NULL",
            "notNull":" IS NOT NULL",
            "notEqual":" <> '{value}'",
            "between" : " BETWEEN {value1} AND {value2}",
            "list" : " IN ({value})"
        };

        if(type == "INT" || type == "SNGL" || type == "DATE" || type == "CHK"){
            query = $filter['filterField']+conditionArray[$filter['condition']];
        }else{
            query = $filter['filterField']+conditionArrayWithQuotes[$filter['condition']];
        }


        if($filter['condition'] == 'between'){
            var start = "CONVERT(DATETIME,'"+ $filter['value']['start']+"',104)";
            var end = "CONVERT(DATETIME,'"+ $filter['value']['end']+"',104) + 1";
            condition = query.replace("{value1}", start);
            condition = condition.replace("{value2}", end);
        }else{
            if(type == "SNGL"){
                value = "CONVERT(DATETIME,'"+value+"',104)";
            }
            condition = query.replace("{value}", value);
        }
        return condition;
    }

    function buildWhere(conditions){
        var count = 1;
        var groupNumber = 1;
        var groups = {};
        //build groups
        for (var conditionId in conditions) {
            var filterObject =  conditions[conditionId];
            if(count == 1){
                filterObject.andOrCondition = 'AND';
                filterObject.isGroupCondition = true;
            }

            if(filterObject.isGroupCondition){
                if(!groups.hasOwnProperty(groupNumber)){
                    groups[groupNumber] = [];
                }
                groups[groupNumber].push(filterObject);
            }else{
                groupNumber++;
                groups[groupNumber] = [filterObject];
            }
            count++;
        }

        //build SQL
        var groupCount = 1;
        var filterWhere = '';
        for (var groupNumber in groups) {
            var filtersGroup = groups[groupNumber];
            var filterNumberInGroup = 1;
            var groupWhere = '';
            var groupAndOrCondition = ' AND';
            for (var i = 0; i < filtersGroup.length; i++) {
                var filterObject = filtersGroup[i];
                if(i == 0 && groupCount != 1){
                    groupAndOrCondition = filterObject.andOrCondition;
                }
                if(i == 0){
                    groupWhere += ' ' + buildCondition(filterObject);
                }else{
                    groupWhere += ' ' + filterObject.andOrCondition + ' ' + buildCondition(filterObject);
                }
                filterNumberInGroup++;
            }
            filterWhere += ' ' + groupAndOrCondition + ' ('+groupWhere+')';
            groupCount++;
        }
        return filterWhere;
    }

    //BUILD WHERE CONDITION
    function buildWhereClause(viewDataFilter, activeFilterValue){
        var where = '';
        var whereClause = '';
        var isActiveFilter = false;
        if(typeof viewDataFilter != 'undefined'){
            //ACTIVE STATUS
            if(viewDataFilter['FIL_USE_ACTIVITY'] == 1){
                var activeState = '';
                switch(activeFilterValue){
                    case 'active':
                        activeState = '(ACTIVE_STATUS = 1)';
                        break;
                    case 'inactive':
                        activeState = '(ACTIVE_STATUS = 0)';
                        break;
                    case 'all':
                        activeState = '(ACTIVE_STATUS = 0 OR ACTIVE_STATUS = 1)';
                        break;
                }
                isActiveFilter = true;
                whereClause +='WHERE ('+activeState;
            }else{
                whereClause +='WHERE ((1=1)';
            }

            if (viewDataFilter['FIL_USE_HIERARCHY'] == 1)
            {
                whereClause += " AND ((USE_CODE IN (" + Globals.getUserHierarchy() + ")) OR (USE_CODE IS NULL))";
            }
            if (viewDataFilter['FIL_LOC_HIERARCHY'] == 1)
            {
                whereClause += " AND ((BDN_CODE = " + Globals.getUserData()['USE_BDN_CODE'] + ") OR (BDN_CODE IS NULL))";
            }
            if (viewDataFilter['FIL_USE_SINGLE_HIERARCHY'] == 1)
            {
                whereClause += " AND ((USE_CODE = " + Globals.getUserData()['USE_CODE']+ ") OR (USE_CODE IS NULL))";
            }
            if (viewDataFilter['FIL_USE_COMPANY'] == 1)
            {
                whereClause += " AND (CMP_CODE = " + Globals.getUserData()['CMP_CODE'] + ")";
            }
            where = whereClause + ')';
        }else{
            where = 'WHERE (1=1)';
        }
        return {where: where, isActiveFilter: isActiveFilter};
    }

    return {
        buildWhere: buildWhere,
        buildWhereClause: buildWhereClause,
        getFilterConditions: getFilterConditions,
        getKeyGridFilterConditions: function(){
            return keyGridFilterConditions;
        }
    }
};