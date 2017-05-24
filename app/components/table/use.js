/**
 * Created by Евгений on 05.04.2017.
 */
userTable = new TableComponent({
    columns: [
        {name: 'name', title: 'User name', width: '30%'},
        {name: 'surname', title: 'User surname', width: '30%'},
        {name: 'age', title: 'User age', width: '20%'},
        {name: 'height', title: 'User height', width: '20%'},
    ],
    data1:[
        {
            key: 1,
            name: {value: 'Vasya'},
            surname: {value: 'Pupkin'},
            age: {value: '20', style: 'font-size: 18px;'},
            height: {value: '180', style: 'color: red;'}
        },
        {
            key: 2,
            name: {value: 'Vasya', style: 'background: #ccc;'},
            surname: {value: 'Pupkin', style: 'font-weight: 700;'},
            age: {value: '20', style: false},
            height: {value: '180', style: false}
        },
        {
            key: 3,
            name: {value: 'Vasya', style: false},
            surname: {value: 'Pupkin', style: false},
            age: {value: '20', style: false},
            height: {value: '180', style: false}
        }
    ],
    data:[
        {key: 1, name: 'Vasya', surname: 'Pupkin', age: '20', height: '180'},
        {key: 2, name: 'Vasya', surname: 'Pupkin', age: '20', height: '180'},
        {key: 3, name: 'Vasya', surname: 'Pupkin', age: '20', height: '180'},
        {key: 4, name: 'Vasya', surname: 'Pupkin', age: '20', height: '180'}
    ],
    isFlat: true,
    isSelectColumn: true,
    onCheck: function(count){
        console.log('checked items - '+count);
    },
    style: "width: 50%;"
});