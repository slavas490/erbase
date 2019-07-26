import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import { ContextMenu } from '../app/contextMenu';

const FieldType = {
    NONE: 0,
    BOOLEAN: 1,
    STRING: 2,
    INTEGER: 4,
    FLOAT: 8,
    DATETIME: 16,
    BUTTON: 32,
    LINK: 64,
    TEXTAREA: 128
}

const FieldDataClass = {
    FIELD: 0,
    ACTION: 1
}

const Field = (...args) => 
{
    if (args.length > 0) {
        let type = args[0],
            name = args[1],
            value = args[2],
            data = args[3];

        return { type, name, value, data }
    }
    else {
        return { type: null, name: null, value: null };
    }
}

const SortableField = (...args) => {
    let field = Field(...args);
    field.sortable = true;

    return field;
}

class Table extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            sorting: {},
            itemsPerPage: 10,
            pageCount: 30,
            page: 0,
            contextMenuData: []
        };
    }

    datetime = (value) => {
        value = parseInt(value);

        if (value < 1000000000000) {
            value *= 1000;
        }

        let date = new Date(value),
            year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate(),
            hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds();

        return (year + '.' +
               (month < 10 ? '0' : '') + month + '.' +
               (day < 10 ? '0' : '') + day + ' ' +
               (hours < 10 ? '0' : '') + hours + ':' +
               (minutes < 10 ? '0' : '') + minutes + ':' +
               (seconds < 10 ? '0' : '') + seconds);
    }

    getDataClassType = (data) => {
        switch (data.type) {
            case FieldType.BUTTON:
            case FieldType.TEXTAREA:
                return FieldDataClass.ACTION;
            
            default:
                return FieldDataClass.FIELD;
        }
    }

    parseValue = (header, data) => {
        let type = header.type,
            value = data[header.name],
            name = null,
            isInvertValue = false;

        if (this.getDataClassType(header) === FieldDataClass.ACTION) {
            value = header.value;

            if (header.name[0] === '!') {
                isInvertValue = true;
                name = header.name.substr(1);
            }
            else {
                name = header.name;
            }
        }
        
        switch (type) {
            case FieldType.NONE:
                return value;

            case FieldType.BOOLEAN:
                return data[name] === (isInvertValue ? false : true) ? header.data[0] : header.data[1];

            case FieldType.STRING:
                return String(value);

            case FieldType.INTEGER:
                return parseInt(value);

            case FieldType.FLOAT:
                return value.toFixed(2);

            case FieldType.DATETIME:
                return this.datetime(value);

            case FieldType.BUTTON:
                return (data[name] === (isInvertValue ? false : true) || (header.value instanceof Array)) ? <button onClick={() => this.props.onAction(name, data.id)} className="btn btn-info btn-sm">{(header.value instanceof Array) ? (data[name] === (isInvertValue ? false : true) ? header.value[0] : header.value[1]) : value}</button> : null;

            case FieldType.LINK:
                let textSrc = header.data ? header.data[0] : null;
                let hrefSrc = header.data ? header.data[1] : null;
                return <a href={data[hrefSrc]} rel="noopener noreferrer" target="_blank">{data[textSrc]}</a>;

            case FieldType.TEXTAREA:
                return <textarea className="form-control form-control-sm" onChange={(e) => this.props.onAction(name + ':onChange', { event: e.target, id: data.id })} onBlur={(e) => this.props.onAction(name + ':onBlur', { event: e.target, id: data.id })} value={data[name]}/>;

            default:
                return null;
        }
    }

    hideContextMenu = () => {
        this.setState({ contextMenuList: [] });
    }

    onContextMenu = (e, headerData, rowData) => {
        e.preventDefault();
        
        let cellData = rowData[headerData.name];
        
        if(this.props.onContextMenu) {
            let list = this.props.onContextMenu(cellData, headerData, rowData);

            if(list instanceof Array) {
                this.setState({
                    contextMenuData: {
                        data: list,
                        mousePosition: {
                            x: e.pageX,
                            y: e.pageY
                        },
                        header: headerData.name,
                        row: rowData.id
                    },
                    contextMenuId: headerData.name + rowData.id
                });
            }
        }
        return false;
    }

    onSelectContextMenu = (data) => {
        let contextMenuData = this.state.contextMenuData;

        if(this.props.onSelectContextMenu) {
            this.props.onSelectContextMenu(data, contextMenuData.header, contextMenuData.row);
        }
    }

    createCell = (header, data) => {
        let cellContentRender = this.props.cellContentRender,
            cellHighlighter = this.props.cellHighlighter ? this.props.cellHighlighter(header, data) : null,
            value = null,
            style = {};
        
        if(typeof cellHighlighter === 'string') {
            style.backgroundColor = cellHighlighter;
        }

        if(cellContentRender) {
            value = cellContentRender(header, data);

            if(value === null) {
                value = this.parseValue(header, data); 
            }
        }
        else {
            value = this.parseValue(header, data);
        }
        
        return {
            value,
            style
        };
    }

    onMouseMove = (event, header, data) => {
        if(this.props.onMouseMove) {
            this.props.onMouseMove(event, header, data);
        }
    }

    onMouseLeave = (event, header, data) => {
        if(this.props.onMouseLeave) {
            this.props.onMouseLeave(event, header, data);
        }
    }

    expandRow = (id) => {
        if(this.state.expandRow === id) {
            this.setState({ expandRow: null });
        }
        else {
            this.setState({ expandRow: id });
        }
    }

    createRow = (data) => {
        let struct = this.props.struct,
            rowHighlighter = this.props.rowHighlighter ? this.props.rowHighlighter(data) : null,
            style = {};

        if(typeof rowHighlighter === 'string') {
            style.backgroundColor = rowHighlighter;
        }

        const newRow = (keyUniq, data, expandKeys) => {
            return (
                <tr onClick={() => this.expandRow(data.id)} className={ keyUniq + ' ' + (data.childrens ? 'expand' + (data.id === this.state.expandRow ? ' open' : '') : null) } key={keyUniq + ':' + data.id} style={style}>
                    {
                        struct.map((header, indx) => {
                            let cell = this.createCell(header, data);
                            
                            return (
                                <td style={cell.style} onContextMenu={(e) => this.onContextMenu(e, header, data)} key={header.name} onMouseMove={(e) => this.onMouseMove(e, header, data)} onMouseLeave={(e) => this.onMouseLeave(e, header, data)}>
                                    <div>
                                        { data.childrens ?
                                            expandKeys && expandKeys[indx].length === 1 ? cell.value : <img className="expand" alt="" src="/image/down-arrow.png" />
                                          :
                                            cell.value
                                        }
                                    </div>
                                    <ContextMenu data={this.state.contextMenuData} isActive={header.name + data.id === this.state.contextMenuId} onSelect={this.onSelectContextMenu}/>
                                </td>
                            )
                        })
                    }
                </tr>
            )
        }

        let expandKeys = [];

        if(data.childrens) {
            for(let i=0; i<data.childrens.length; i++) {
                struct.map((header, j) => {
                    let cellValue = ReactDOMServer.renderToString(data.childrens[i][header.name]);

                    if(!expandKeys[j]) {
                        expandKeys[j] = [cellValue];
                    }

                    for(let z=0; z<expandKeys[j].length; z++) {
                        if(cellValue !== expandKeys[j][z]) {
                            expandKeys[j].push(cellValue);
                        }
                    }

                    return null;
                });
            }
        }
        
        return (
            <>
                { newRow('r', data, expandKeys) }
                
                { data.childrens && data.id === this.state.expandRow ? data.childrens.map(item => newRow('child', item)) : null }
            </>
        )
    }

    sortTable = (header) => {
        if(!header.sortable) {
            return;
        }

        let state = Object.assign({}, this.state),
            sortBy,
            column = header.name;

        if (column[0] === '!') {
            column = column.substr(1);
        }
        
        if (state.sorting[column] === 'ASC') {
            sortBy = 'DESC';
        }
        else {
            sortBy = 'ASC';
        }

        state.sorting = {};
        state.sorting[column] = sortBy;

        this.setState(state);
    }

    getClassForColumn = (header) => {
        let column = header.name;

        if (column[0] === '!') {
            column = column.substr(1);
        }

        let sorting = this.state.sorting[column];

        return 'sortable ' + (sorting ? (this.state.sorting[column] === 'ASC' ? 'up' : 'down') : '');
    }

    sortData = (data) => {
        let sorting = this.state.sorting,
            field = Object.keys(this.state.sorting)[0],
            isASC = sorting[field] === 'ASC';

        if (field) {
            data = data.sort((a, b) => {
                if(isASC) {
                    if (a[field] < b[field]) return -1;
                    if (a[field] > b[field]) return 1;
                }
                else {
                    if (a[field] > b[field]) return -1;
                    if (a[field] < b[field]) return 1;
                }

                return 0;
            });
        }

        return data; 
    }

    setItemsPerPage = (data) => {
        this.setState({ itemsPerPage: data, page: 0 });
    }

    setPage = (data) => {
        this.setState({ page: data });
    }

    getPagination = (dataLength) => {
        let page = this.state.page,
            pages_count = Math.ceil(dataLength / this.state.itemsPerPage);

        let pages = [];

        for (let i = 2; i < pages_count; i++) {
            if (i - page >= 0 && i - page < 3) {
                pages.push(i);
            }
        }

        return (
            <span>
                { (page > 0 ? <span className="link" onClick={() => this.setPage(page - 1)}> &#8592; </span> : null) }
                
                <span onClick={() => this.setPage(0)} className={'link ' + (page === 0 ? 'active' : '')}>1</span>

                {(2 - page < 0 ? <span className="link fill">...</span> : null)}

                { pages.map(i => <span key={i} onClick={() => this.setPage(i <= page ? page - 1 : page + 1)} className={'link ' + (i === page + 1 ? 'active' : '')}>{ i }</span>)}

                {(pages_count - page > 3 ? <span className="fill link">...</span> : null)}

                { pages_count > 1 && <span onClick={() => this.setPage(pages_count - 1)} className={'link ' + (page === pages_count - 1 ? 'active' : '')}>{ pages_count }</span> }
            
                {(page < pages_count - 1 ? <span className="link" onClick={() => this.setPage(page + 1)}> &#8594; </span> : null)}
            </span>
        );
    }

    render = () => {
        let struct = this.props.struct,
            data = this.sortData(this.props.data);

        let dataFromIndex = this.state.itemsPerPage * this.state.page,
            dataToIndex = Math.min(dataFromIndex + this.state.itemsPerPage, data.length);
            
        let pageData = data.slice(dataFromIndex, dataToIndex);

        return (
            <div className="table">
                <table>
                    <tbody>
                        <tr>
                            { struct.map(header => 
                                <td className={this.getClassForColumn(header)} onClick={() => this.sortTable(header)} key={header.name}>
                                    <div>
                                        { this.getDataClassType(header) === FieldDataClass.FIELD ? header.value : null } <span className="sort up">&#x25B2;</span><span className="sort down">&#x25BC;</span>
                                    </div>
                                </td>
                            )}
                        </tr>

                        { pageData.map(data => this.createRow(data)) }
                    </tbody>
                </table>
                <div className="footer">
                    <div>Страница <span className="pag">{this.getPagination(data.length)}</span>
                    </div>
                    <div>Объектов
                        <span className="link" onClick={() => this.setItemsPerPage(10)}>10</span>
                        <span className="link" onClick={() => this.setItemsPerPage(20)}>20</span>
                        <span className="link" onClick={() => this.setItemsPerPage(30)}>30</span>
                    </div>
                </div>
            </div>
        )
    }
}

Table.propTypes = {
    header: PropTypes.array,
    data: PropTypes.array
};

export {
    Table,
    Field,
    SortableField,
    FieldType
}