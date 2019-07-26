import React from 'react'
import { Link } from 'react-router-relative-link';
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import { setActiveBuyer, setBuyerFilter } from '../../../modules/buyer'
import { Table, Field, SortableField, FieldType } from '../table'
import swal from 'sweetalert'
import moment from 'moment'

class BuyersMainPage extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            filter: {
                id: '',
                rooms: 0,
                priceFrom: '0',
                priceTo: '0',
                district: 0,
                floor: '',
                squareFrom: '0',
                squareTo: '0'
            },
            tableTooltip: {
                id: 0,
                show: false,
                x: null,
                y: null,
                html: ''
            }
        };

        this.tableStructAll = [SortableField(FieldType.INTEGER, 'id', '№'),
                            SortableField(FieldType.NONE, 'dates', <>Дата создания,<br/>редактирования,<br/>удаления</>),
                            SortableField(FieldType.STRING, 'roomsHTML', 'Комнат'),
                            SortableField(FieldType.STRING, 'cost', 'Стоимость'),
                            SortableField(FieldType.STRING, 'districtHTML', 'Район'),
                            SortableField(FieldType.STRING, 'floor', 'Этаж'),
                            SortableField(FieldType.STRING, 'squareHTML', 'Площадь'),
                            SortableField(FieldType.STRING, 'realtorName', 'Риэлтор'),
                            SortableField(FieldType.STRING, 'info', 'Комментарий')];

        this.tableStructMy = [...this.tableStructAll.slice(0,7),
                            SortableField(FieldType.STRING, 'name', 'Клиент'),
                            SortableField(FieldType.STRING, 'info', 'Комментарий'),
                            Field(FieldType.BUTTON, 'edit', <i class="fas fa-pencil-alt"/>),
                            Field(FieldType.BUTTON, '!deleted', <i class="fas fa-trash-alt"/>)];

        this.tableStructDeleted = [...this.tableStructMy.slice(0,7),
                            SortableField(FieldType.STRING, 'realtorName', 'Риэлтор'),
                            SortableField(FieldType.STRING, 'deletedReason', 'Причина удаления'),
                            SortableField(FieldType.STRING, 'info', 'Комментарий'),
                            Field(FieldType.BUTTON, 'edit', <i class="fas fa-pencil-alt"/>),
                            Field(FieldType.BUTTON, 'remove', <i class="fas fa-trash-restore"/>)];
    }

    getMode = () => {
        const location = this.props.location;
        let pathname = location.pathname.split('/'),
            currentPage = pathname[pathname.length - 1];

        switch (currentPage) {
            case 'all':
                return 'all';
            
            case 'deleted':
                return 'deleted';

            default:
                return 'my';
        }
    }

    tableHandler = (action, value) => {
        const user = this.props.user;
        let buyer = this.props.data.find(item => item.id === value);

        switch (action) {
            case 'edit':
                if(buyer) {
                    this.props.setActiveBuyer(buyer);
                    this.props.changePage('/buyers/edit');
                }

                break;

            case 'deleted':
                if(buyer) {
                    if(!buyer.deleted) {
                        swal({ title: "Вы уверены?", icon: "warning", buttons: ["Нет", "Да"] })
                        .then((ok) => {
                            if(ok) {
                                Api.delete('buyers/' + value)
                                .then(() => {
                                    this.props.updateBuyers();
                                    swal({ title: "Успешно", icon: "success", button: "Ок" });
                                })
                                .catch(err => {
                                    swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
                                });
                            }
                        });
                    }
                    // else {
                    //     Api.put('buyers/restore/' + value)
                    //     .then(() => {
                    //         this.props.updateBuyers();
                    //         swal({ title: "Успешно", icon: "success", button: "Ок" });
                    //     })
                    //     .catch(err => {
                    //         swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
                    //     });
                    // }
                }

                break;

            case 'remove':
                    if(user.isAdmin) {
                        swal({ title: "Вы уверены?", icon: "warning", buttons: ["Нет", "Да"] })
                        .then((ok) => {
                            if(ok) {
                                Api.delete('buyers/' + value + '?completely=true')
                                .then(() => {
                                    this.props.updateBuyers();
                                    swal({ title: "Успешно", icon: "success", button: "Ок" });
                                })
                                .catch(err => {
                                    swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
                                });
                            }
                        });
                    }
                    break;

            default:
                return;
        }
    }

    rowHighlighter = (data) => {
        if (this.getMode() !== 'all') {
            return null
        }
        else if (data.realtor === this.props.user.id) {
            return this.props.rowHighlight[0];
        }
    }

    getRepairType = (data) => {
        let type = this.props.general.repairType.find(item => item.id === data.repairs)
        
        if(type) {
            return type.name;
        }
        else {
            return null;
        }
    }

    getUserAgency = (user) => {
        let agency = this.props.general.agency.find(item => item.id === user.realtorAgencyId);

        if(agency && agency.id) {
            return agency.name;
        }
        else {
            return user.realtorAgency;
        }
    }
    
    getDistrict = (data) => {
        let arr = data.district ? data.district.split(',') : [];

        for(let i=0; i<arr.length; i++) {
            let type = this.props.general.district.find(item => item.id === +arr[i]);
            
            if(type) {
                arr[i] = type.name;
            }
        }

        return arr.join(', ');
    }

    setFilter = (name, value) => {
        this.setState({
            filter: {...this.state.filter, [name]: value}
        });
    }

    setGlobalFilter  = (name, value) => {
        let data = {};
        data[name] = value;

        this.props.setBuyerFilter(data);
    }

    onTableMouseMove = (event, header, data) => {
        let tableTooltip = {
            data,
            id: data.id,
            show: true,
            x: event.pageX,
            y: event.pageY + 20
        };

        if(header.name === 'realtorName') {
            tableTooltip.html = <div>
                <div>{ this.getUserAgency(data) }</div>
                <div>{data.realtorName}</div>
                <div>тел. {data.realtorPhone}</div>
                {
                    data.realtorPrivate ?
                        <div>
                            <div>Руководитель:</div>
                            <div>тел. {data.realtorPhoneChief}</div>
                        </div>
                    :
                    null
                }
            </div>;

            this.setState({
                tableTooltip
            });
        }
        else if(header.name === 'name') {
            tableTooltip.html = <div>
                <div>{data.name}</div>
                <div>тел. {data.phoneNumber}</div>
            </div>;

            this.setState({
                tableTooltip
            });
        }
    }

    onTableMouseLeave = (event, header, data) => {
        if((header.name === 'realtorName' || header.name === 'name') && this.state.tableTooltip.id === data.id) {
            let timer = setTimeout(() => {
                this.setState({
                    tableTooltip: {
                        id: 0,
                        show: false
                    }
                });
            }, 100);

            this.setState({
                tableTooltip: {
                    ...this.state.tableTooltip,
                    timer
                }
            });
        }
    }

    onHintMouseOver = () => {
        if(this.state.tableTooltip.timer) {
            clearTimeout(this.state.tableTooltip.timer);
        }
    }

    onHintMouseLeave = () => {
        this.setState({
            tableTooltip: {
                id: 0,
                show: false
            }
        });
    }

    getFilteredData = (data) => {
        const filterData = this.state.filter;
        const globalFilterData = this.props.buyer.filter;
        
        let filter = {
            id: +filterData.id,
            type: +globalFilterData.type,
            rooms: +filterData.rooms,
            priceFrom: parseFloat(filterData.priceFrom),
            priceTo: parseFloat(filterData.priceTo),
            district: +filterData.district,
            floor: +filterData.floor,
            squareFrom: parseFloat(filterData.squareFrom),
            squareTo: parseFloat(filterData.squareTo)
        };

        if(filter.id > 0) {
            data = data.filter(item => item.id === filter.id);
        }

        if(filter.type > 0) {
            data = data.filter(item => item.type === filter.type);
        }

        if(filter.rooms > 0) {
            data = data.filter(item => item.rooms === filter.rooms);
        }

        if(filter.priceFrom > 0) {
            data = data.filter(item => item.costFrom >= filter.priceFrom);
        }

        if(filter.priceTo > 0) {
            data = data.filter(item => item.costTo <= filter.priceTo);
        }

        if(filter.district > 0) {
            data = data.filter(item => {
                let district = item.district.split(',');

                return district.find(d => +d === filter.district);
            });
        }

        if(filter.floor > 0) {
            data = data.filter(item => item.floorFrom <= filter.floor && item.floorTo >= filter.floor);
        }

        if(filter.squareFrom > 0) {
            data = data.filter(item => item.square >= filter.squareFrom);
        }

        if(filter.squareTo > 0) {
            data = data.filter(item => item.square <= filter.squareTo);
        }

        return data;
    }

    formatDate = (date, epmtyFill = '') => {
        if(!date) {
            return epmtyFill;
        }

        return moment(date).format('DD.MM.YYYY HH:mm:ss');
    }

    render = () => {
        const user = this.props.user;
        const rowHighlight = this.props.rowHighlight;
        const filterData = this.state.filter;
        const globalFilterData = this.props.buyer.filter;

        // outer data
        let data = this.props.data.map(item => {
            return ({
                ...item,
                deleted: !!item.deleted,
                roomsHTML: item.rooms + 'к',
                cost: item.costFrom + ' - ' + item.costTo + 'тр',
                priceM2: item.priceM2From + ' - ' + item.priceM2To + 'тр/м2',
                floor: item.floorFrom + ' - ' + item.floorTo,
                squareHTML: item.square + 'м2',
                districtHTML: this.getDistrict(item),
                edit: item.realtor === user.id,
                remove: !!user.isAdmin,
                deletedReason: item.deleted ? (item.deletedType == 0 ? 'Купил(а)' : (item.deletedInfo ? 'Удален с причиной: ' + item.deletedInfo : '')) : null,
                dates: <span>{this.formatDate(item.creationDate, '-')}<br/>{this.formatDate(item.updateDate, '-')}<br/>{this.formatDate(item.deletedTime, '-')}</span>
            })
        });

        // filter
        if(data && data.length > 0) {
            data = this.getFilteredData(data);
        }
        
        let tableStruct = this.tableStructAll;

        // data mode
        let dataMode = this.getMode();
        
        if(dataMode === 'my') {
            tableStruct = this.tableStructMy;
            data = data.filter(item => item.realtor === this.props.user.id && !item.deleted);
        }
        else if(dataMode === 'deleted') {
            tableStruct = this.tableStructDeleted;
            data = data.filter(item => item.deleted);
        }
        else {
            data = data.filter(item => !item.deleted);
        }
        
        //  filterRoomsList
        let filterRoomsList = new Set();
        this.props.data.forEach(item => {
            if(item.rooms > 0) {
                filterRoomsList.add(item.rooms);
            }
        });
        filterRoomsList = Array.from(filterRoomsList);
        filterRoomsList.sort((a, b) => a - b);

        //  filterFloorsList
        let filterFloorsList = new Set();
        this.props.data.forEach(item => {
            for(let i=item.floorFrom; i<=item.floorTo; i++) {
                filterFloorsList.add(i);
            }
        });
        filterFloorsList = Array.from(filterFloorsList);
        filterFloorsList.sort((a, b) => a - b);
        
        return (
            <div className="row">
                <div className="input-group">
                    <div>
                        <select className="custom-select custom-select-sm" value={globalFilterData.type} onChange={(e) => this.setGlobalFilter('type', e.target.value)}>
                            <option value="0">-</option>
                            { this.props.general.propertyType.map(item => <option value={item.id} key={item.id}>{item.name}</option>) }
                        </select>
                    </div>
                    
                    <div className="btn-group" role="group">
                        <Link to="./" className={'btn btn-sm ' + (dataMode === 'my' ? 'active btn-info' : 'btn-light')}>Мои</Link>
                        <Link to="./all" className={'btn btn-sm ' + (dataMode === 'all' ? 'active btn-info' : 'btn-light')}>Все</Link>
                        <Link to="./deleted" className={'btn btn-sm ' + (dataMode === 'deleted' ? 'active btn-info' : 'btn-light')}>Удаленные</Link>
                    </div>

                    <div className="right-align">
                        <Link to="./create" className="btn btn-sm btn-info">+ Новый покупатель</Link>
                    </div>
                </div>

                <div className="hr"></div>

                <div className="input-group filter">
                    <label>
                        <div className="title">№</div>
                        <input className="form-control form-control-sm" style={{width: '70px'}} type="text" value={filterData.id} onChange={(e) => this.setFilter('id', (+e.target.value || 0))}/>
                    </label>

                    <label>
                        <div className="title">Комнат</div>
                        <select className="custom-select custom-select-sm" value={filterData.rooms} onChange={(e) => this.setFilter('rooms', e.target.value)}>
                            <option value="0">-</option>
                            {
                                filterRoomsList.map(item =>
                                    <option key={item} value={item}>{item}к</option>
                                )
                            }
                        </select>
                    </label>

                    <label>
                        <div className="title">Стоимость т.р.</div>
                        <input className="form-control form-control-sm" style={{width: '90px'}} type="text" value={filterData.priceFrom} onChange={(e) => this.setFilter('priceFrom', e.target.value)} onBlur={(e) => this.setFilter('priceFrom', +e.target.value || 0)}/>
                        -
                        <input className="form-control form-control-sm" style={{width: '90px'}} type="text" value={filterData.priceTo} onChange={(e) => this.setFilter('priceTo', e.target.value)} onBlur={(e) => this.setFilter('priceTo', +e.target.value || 0)}/>
                    </label>

                    <label>
                        <div className="title">Район</div>
                        <select className="custom-select custom-select-sm" value={filterData.district} onChange={(e) => this.setFilter('district', e.target.value)}>
                            <option value={0}>-</option>
                            {
                                this.props.general.district.map(item => <option key={item.id} value={item.id}>{item.name}</option>)
                            }
                        </select>
                    </label>

                    <label>
                        <div className="title">Этаж от</div>
                        <select className="custom-select custom-select-sm" value={filterData.floor} onChange={(e) => this.setFilter('floor', e.target.value)}>
                            <option>-</option>
                            {
                                filterFloorsList.map(item => 
                                    <option key={item} value={item}>{item}</option>
                                )
                            }
                        </select>
                    </label>

                    <label>
                        <div className="title">Площадь м2</div>
                        <input className="form-control form-control-sm" style={{width: '70px'}} type="text" value={filterData.squareFrom} onChange={(e) => this.setFilter('squareFrom', e.target.value)} onBlur={(e) => this.setFilter('squareFrom', +e.target.value || 0)}/>
                        -
                        <input className="form-control form-control-sm" style={{width: '70px'}} type="text" value={filterData.squareTo} onChange={(e) => this.setFilter('squareTo', e.target.value)} onBlur={(e) => this.setFilter('squareTo', +e.target.value || 0)}/>
                    </label>
                </div>
            
                <Table data={data} struct={tableStruct} onAction={this.tableHandler} onMouseLeave={this.onTableMouseLeave} onMouseMove={this.onTableMouseMove} rowHighlighter={this.rowHighlighter} />
            
                <div className="input-group table-state">
                    <div>
                        <div style={{background: rowHighlight[0]}}></div> Ваши объекты
                    </div>
                </div>
            
                { this.state.tableTooltip.show &&
                    <div onMouseOver={this.onHintMouseOver} onMouseLeave={this.onHintMouseLeave} className="hint" style={{ top: this.state.tableTooltip.y, left: this.state.tableTooltip.x }}>
                        <div className="pointer"/>
                        <div className="hint-body">
                            { this.state.tableTooltip.html }
                        </div>
                    </div>
                }
            </div>
        )
    }
}

const mapStateToProps = ({ user, general, buyer, router }) => ({
    user,
    general,
    buyer,
    location: router.location
})

const mapDispatchToProps = dispatch =>
bindActionCreators(
{
    setActiveBuyer,
    setBuyerFilter,
    changePage: (page) => push(page)
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BuyersMainPage)
