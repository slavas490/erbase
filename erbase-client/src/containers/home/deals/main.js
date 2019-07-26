import React from 'react'
import { Link } from 'react-router-relative-link'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import { setActiveDeal } from '../../../modules/deal'
import { Table, Field, SortableField, FieldType } from '../table'
import { ContextMenuItem } from '../../app/contextMenu'
import swal from 'sweetalert'
import RemoveDeal from './RemoveDeal'
import moment from 'moment'

class DealsMainPage extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            notes: [],
            removeId: 0
        };

        this.tableStruct = [SortableField(FieldType.INTEGER, 'id', '№'),
                            SortableField(FieldType.NONE, 'dates', <>Дата создания,<br/>редактирования,<br/>удаления</>),
                            SortableField(FieldType.STRING, 'objectName', 'Объект'),
                            SortableField(FieldType.STRING, 'bank', 'Банк'),
                            SortableField(FieldType.STRING, 'reserved', 'Бронь'),
                            SortableField(FieldType.STRING, 'appreciated', 'Оценка'),
                            SortableField(FieldType.STRING, 'saleContract', 'ДКП'),
                            SortableField(FieldType.STRING, 'certificates', 'Справки'),
                            SortableField(FieldType.STRING, 'bankApproval', 'Одобрение'),
                            SortableField(FieldType.STRING, 'securityService', 'СБ'),
                            SortableField(FieldType.STRING, 'admissionToDeal', 'Допуск'),
                            SortableField(FieldType.STRING, 'signed', 'Подписано'),
                            SortableField(FieldType.STRING, 'paid', 'Перечисление'),
                            SortableField(FieldType.STRING, 'apartmentPassed', 'Передача'),
                            SortableField(FieldType.STRING, 'fedsfm', 'РФМ'),
                            Field(FieldType.BUTTON, 'edit', <i class="fas fa-pencil-alt"/>),
                            Field(FieldType.BUTTON, '!deleted', <i class="fas fa-trash-alt"/>)];

            this.tableStructArchive = [
                ...this.tableStruct.slice(0,15),
                SortableField(FieldType.STRING, 'deletedReason', 'Причина удаления')
            ];

        this.dealCells = ['reserved', 'appreciated', 'saleContract', 'certificates', 'bankApproval', 'securityService', 'admissionToDeal', 'signed', 'paid', 'apartmentPassed', 'fedsfm'];
    }

    tableHandler = (action, value) => {
        let deal = this.props.data.find(item => item.id === value);

        switch (action) {
            case 'edit':
                if(deal) {
                    this.props.setActiveDeal(deal);
                    this.props.changePage('/deals/edit');
                }

                break;
            
            case 'deleted':
                this.setState({ removeId: value });

                break;

            default:
                break;
        }
    }

    componentDidMount () {
        this.getNotes();
    }

    cellHighlighter = (header, row) => {
        let cellValue = row[header.name];
        let rowHighlight = this.props.rowHighlight;

        if(this.dealCells.indexOf(header.name) !== -1) {

            switch (cellValue) {
                case 1: return rowHighlight[0];
                case 2: return rowHighlight[1];
                case 3: return rowHighlight[2];
                default: return null;
            }
        }
        else if(header.name === 'bank' && cellValue) {
            return rowHighlight[0];
        }
        else {
            return null;
        }
    }

    onContextMenu = (cell, header, row) => {
        if(this.dealCells.indexOf(header.name) !== -1) {
            let list = [
                ContextMenuItem('none', 'Нет', (cell === 0), null),
                ContextMenuItem('done', 'Завершено', (cell === 1), null),
                ContextMenuItem('waiting', 'Ожидание', (cell === 2), null),
                ContextMenuItem('problem', 'Проблемы', (cell === 3), null),
            ];
    
            return list;
        }
        else {
            return null;
        }
    }

    onSelectContextMenu = (contextMenuName, headerName, rowId) => {
        let stateId = 0;

        switch (contextMenuName) {
            case 'none':
                stateId = 0;
                break;
            case 'done':
                stateId = 1;
                break;
            case 'waiting':
                stateId = 2;
                break;
            case 'problem':
                stateId = 3;
                break;
            default:
                break;
        }

        Api.put('deals/' + rowId + '/' + headerName + '/' + stateId)
        .then(out => {
            this.props.updateDeals();
        })
        .catch(out => {
        });
    }

    cellContentRender = (header, row) => {
        if(this.dealCells.indexOf(header.name) !== -1) {
            return this.getDealStatus(row[header.name]);
        }
        else {
            return null;
        }
    }

    getDealStatus = (data) => {
        switch (data) {
            case 1: return 'Есть';
            case 2: return 'Ожидание';
            case 3: return 'Проблемы';
            default: return '';
        }
    }

    getNotes = () => {
        Api.get('/notes')
        .then(out => {
            this.setState({ notes: out });
        });
    }

    createNote = () => {
        setTimeout(() => {
            Api.post('/notes')
            .then(() => {
                this.getNotes();
            });
        }, 200);
    }

    notesChanged = (id, data) => {
        let state = Object.assign({}, this.state),
            note = state.notes.find(item => item.id === id);

        if(note) {
            note.value = data;
        }

        this.setState(state);
    }

    notesChangedDone = (id, data) => {
        Api.put('/notes/' + id, { data })
        .then(() => {
            this.getNotes();
        });
    }

    removeNote = (id) => {
        Api.delete('/notes/' + id)
        .then(() => {
            this.getNotes();
        });
    }

    getBankName = (id) => {
        let bank = this.props.general.banks.find(item => item.id === id);

        if(bank) {
            return bank.name;
        }
        else {
            return null;
        }
    }

    getMode = () => {
        const location = this.props.location;
        let pathname = location.pathname.split('/'), dataMode = 'archive';

        if(pathname[pathname.length - 1] !== 'archive') {
            dataMode = 'active';
        }

        return dataMode;
    }

    onDealRemove = (data) => {
        // swal({ title: "Вы уверены?", icon: "warning", buttons: ["Нет", "Да"] })
        // .then((ok) => {
            // if(ok) {
        Api.delete('deals/' + this.state.removeId, data)
        .then(() => {
            this.props.updateDeals();
            swal({ title: "Успешно", icon: "success", button: "Ок" });
        })
        .catch(err => {
            swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
        })
        .finally(() => {
            this.setState({ removeId: 0 });
        });
        
            // }
        // });
    }

    formatDate = (date, epmtyFill = '') => {
        if(!date) {
            return epmtyFill;
        }

        return moment(date).format('DD.MM.YYYY HH:mm:ss');
    }
    
    render = () => {
        const state = this.state;
        let rowHighlight = this.props.rowHighlight;
        let data = this.props.data || [];
        let tableStruct = this.tableStruct;

        data = data.map(item => {
            return {
                ...item,
                bank: this.getBankName(item.bank),
                edit: true,
                deleted: !!item.deleted,
                dates: <span>{this.formatDate(item.creationDate, '-')}<br/>{this.formatDate(item.updateDate, '-')}<br/>{this.formatDate(item.deletedTime, '-')}</span>,
                deletedReason: item.deleted ? (item.deletedType == 0 ? 'Купил(а)' : (item.deletedInfo ? 'Удален с причиной: ' + item.deletedInfo : '')) : null,
            }
        });

        // data mode
        let dataMode = this.getMode();
        
        if(dataMode === 'archive') {
            data = data.filter(item => item.deleted);
            tableStruct = this.tableStructArchive;
        }
        else {
            data = data.filter(item => !item.deleted);
        }

        return (
            <div className="row">
                <div className="input-group">
                    <div className="btn-group" role="group">
                        <Link to="./" className={'btn btn-sm ' + (dataMode === 'active' ? 'active btn-info' : 'btn-light')}>Активные</Link>
                        <Link to="./archive" className={'btn btn-sm ' + (dataMode === 'archive' ? 'active btn-info' : 'btn-light')}>Архив</Link>
                    </div>

                    <div className="right-align">
                        <Link to="./create" className="btn btn-sm btn-info">+ Новая сделка</Link>
                    </div>
                </div>

                <Table data={data} onContextMenu={this.onContextMenu} onSelectContextMenu={this.onSelectContextMenu} struct={tableStruct} onAction={this.tableHandler} cellContentRender={this.cellContentRender} cellHighlighter={this.cellHighlighter}/>
            
                <div className="input-group table-state">
                    <div>
                        <div style={{background: rowHighlight[0]}}></div> Завершено
                    </div>

                    <div>
                        <div style={{background: rowHighlight[1]}}></div> Ожидание
                    </div>

                    <div>
                        <div style={{background: rowHighlight[2]}}></div> Проблемы
                    </div>
                </div>
            
                <div className="hr"></div>
            
                <div className="notes">
                    <button className="btn btn-sm btn-info" onClick={this.createNote}>+ Новая заметка</button>

                    <div className="list">
                        {
                            this.state.notes.map(note =>
                                <div key={note.id}>
                                    <div className="control">
                                        <div className="delete" onClick={() => this.removeNote(note.id)}>&#10539;</div>
                                    </div>
                                    <div className="value">
                                        <textarea value={note.value} onChange={(e) => this.notesChanged(note.id, e.target.value)} onBlur={(e) => this.notesChangedDone(note.id, e.target.value)} />
                                    </div>
                                </div>    
                            )
                        }
                    </div>
                </div>

                {
                    state.removeId > 0 && <RemoveDeal id={state.removeId} onClose={() => this.setState({ removeId: 0 })} onRemove={this.onDealRemove}/>
                }
            </div>
        )
    }
}

const mapStateToProps = ({ user, general, router }) => ({
    user,
    general,
    location: router.location
})

const mapDispatchToProps = dispatch =>
bindActionCreators(
{
    setActiveDeal,
    changePage: (page) => push(page)
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DealsMainPage)
