import React from 'react'
import { Link } from 'react-router-relative-link'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import { unsetActiveAd } from '../../../modules/user'
import { setActiveSeller, setSellerFilter } from '../../../modules/seller'
import { Table, Field, SortableField, FieldType } from '../table'
import swal from 'sweetalert'
import ImageGallery from 'react-image-gallery'
import moment from 'moment'
import FullInfo from './FullInfo'
import OfferWindow from './OfferWindow'

import "react-image-gallery/styles/css/image-gallery.css";

class SellersMainPage extends React.Component {
    constructor (props) {
        super(props);
        
        this.state = {
            filter: {
                id: '',
                type: 0,
                rooms: -1,
                priceFrom: '0',
                priceTo: '0',
                priceM2From: '0',
                priceM2To: '0',
                district: 0,
                floor: '',
                squareFrom: '0',
                squareTo: '0'
            },
            layoutWindow: {
                id: 0,
                isShow: false,
                type: 'layout'
            },
            tableTooltip: {
                id: 0,
                show: false,
                x: null,
                y: null,
                html: ''
            },
            imageGalleryArray: [],
            sellerFullInfo: null,
            showOfferWindow: false
        };
        
        this.tableStructAll = [Field(FieldType.NONE, 'isSelected', ''),
                            SortableField(FieldType.INTEGER, 'id', '№'),
                            SortableField(FieldType.NONE, 'dates', <>Дата создания,<br/>редактирования,<br/>удаления</>),
                            SortableField(FieldType.NONE, 'object', 'Комн. Тип'),
                            SortableField(FieldType.NONE, 'costHTML', <>Стоимость<br/>Цена за м²</>),
                            SortableField(FieldType.NONE, 'address', 'Район, Адрес'),
                            SortableField(FieldType.STRING, 'floorHTML', 'Этаж'),
                            SortableField(FieldType.STRING, 'squareHTML', 'Площадь'),
                            SortableField(FieldType.NONE, 'layout', 'Фото/план'),
                            SortableField(FieldType.STRING, 'repairs', 'Ремонт'),
                            SortableField(FieldType.STRING, 'realtorName', 'Риэлтор'),
                            SortableField(FieldType.NONE, 'info', 'Комментарий'),
                            Field(FieldType.BUTTON, 'fullInfo', <i class="fa fa-info"></i>)
                        ];

        if(this.props.user.isAdmin) {
            this.tableStructAll.push(Field(FieldType.BUTTON, 'isChecked', 'На модерацию'));
        }
                            
        this.tableStructMy = [Field(FieldType.NONE, 'isSelected', ''),
                            SortableField(FieldType.INTEGER, 'id', '№'),
                            SortableField(FieldType.NONE, 'dates', <>Дата создания,<br/>редактирования,<br/>удаления</>),
                            SortableField(FieldType.NONE, 'object', 'Комн. Тип'),
                            SortableField(FieldType.NONE, 'costHTML', <>Стоимость<br/>Цена за м²</>),
                            SortableField(FieldType.NONE, 'address', 'Район, Адрес'),
                            SortableField(FieldType.STRING, 'floorHTML', 'Этаж'),
                            SortableField(FieldType.STRING, 'squareHTML', 'Площадь'),
                            SortableField(FieldType.NONE, 'layout', 'Фото/план'),
                            SortableField(FieldType.STRING, 'repairs', 'Ремонт'),
                            SortableField(FieldType.STRING, 'name', 'Клиент'),
                            SortableField(FieldType.NONE, 'info', 'Комментарий'),
                            Field(FieldType.BUTTON, 'fullInfo', <i class="fa fa-info"></i>),
                            Field(FieldType.BUTTON, 'edit', <i class="fas fa-pencil-alt"/>),
                            Field(FieldType.BUTTON, '!deleted', <i class="fas fa-trash-alt"/>)
        ];
        this.tableStructModerate = [...this.tableStructMy];
        this.tableStructModerate[10] = SortableField(FieldType.STRING, 'realtorName', 'Риэлтор');

        this.tableStructDeleted = [
                            ...this.tableStructMy.slice(0, 10),
                            SortableField(FieldType.STRING, 'realtorName', 'Риэлтор'),
                            SortableField(FieldType.STRING, 'deleteReason', 'Причина удаления'),
                            SortableField(FieldType.NONE, 'info', 'Комментарий'),
                            Field(FieldType.BUTTON, 'fullInfo', <i class="fa fa-info"></i>),
                            Field(FieldType.BUTTON, 'edit', <i class="fas fa-pencil-alt"/>),
                            Field(FieldType.BUTTON, 'remove', <i class="fas fa-trash-restore"/>)
        ];
    }

    tableHandler = (action, value) => {
        const user = this.props.user;
        let seller = Object.assign({}, this.props.data.find(item => item.id === value));
        
        switch (action) {
            case 'edit':
                if(seller) {
                    this.props.unsetActiveAd();
                    this.props.setActiveSeller(seller);
                    this.props.changePage('/sellers/edit');
                }

                break;
            
            case 'deleted':
                if(seller) {
                    if(!seller.deleted) {
                        swal({ title: "Вы уверены?", icon: "warning", buttons: ["Нет", "Да"] })
                        .then((ok) => {
                            if(ok) {
                                Api.delete('sellers/' + value)
                                .then(() => {
                                    this.props.updateSellers();
                                    swal({ title: "Успешно", icon: "success", button: "Ок" });
                                })
                                .catch(err => {
                                    swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
                                });
                            }
                        });
                    }
                    // else {
                    //     Api.put('sellers/restore/' + value)
                    //     .then(() => {
                    //         this.props.updateSellers();
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
                            Api.delete('sellers/' + value + '?completely=true')
                            .then(() => {
                                this.props.updateSellers();
                                swal({ title: "Успешно", icon: "success", button: "Ок" });
                            })
                            .catch(err => {
                                swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
                            });
                        }
                    });
                }
                break;

            case 'isChecked':
                if(seller) {
                    swal({ title: "Вы уверены?", icon: "warning", buttons: ["Нет", "Да"] })
                    .then((ok) => {
                        if(ok) {
                            Api.put('sellers/cancel/' + seller.id)
                            .then(() => {
                                this.props.updateSellers();
                                swal({ title: "Успешно", icon: "success", button: "Ок" });
                            })
                            .catch(err => {
                                swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
                            });
                        }
                    });
                }

                break;

            case 'fullInfo':
                if(seller) {
                    seller.floor = seller.floor + '/' + seller.floorsCount;
                    seller.square = seller.square + ' м2';
                    seller.repairs = this.getRepairType(seller);
                    seller.layout = <span>{ seller.photosCount && <span className="link" onClick={() => this.showLayoutWindow(seller.id, 'photos')}>{seller.photosCount}</span> } / { seller.layoutsCount && <span className="link" onClick={() => this.showLayoutWindow(seller.id, 'layout')}>{seller.layoutsCount}</span>}</span>;
                    seller.address = <>р-н. { this.getDistrict(seller) }, { seller.street + ', ' + seller.houseNumber }</>;
                    
                    this.setState({ sellerFullInfo: seller });
                }
                
            default:
                break;
        }
    }

    rowHighlighter = (data) => {
        let mode = this.getMode();
        
        if(mode === 'moderation' && data.revisionComment) {
            return this.props.rowHighlight[2];
        }
        else if (mode !== 'all') {
            return null
        }
        else if (data.realtor === this.props.user.id) {
            return this.props.rowHighlight[0];
        }
    }

    getMode = () => {
        const location = this.props.location;
        let pathname = location.pathname.split('/'),
            mode = pathname[pathname.length - 1];

        switch (mode) {
            case 'all':
                return 'all';
            
            case 'moderation':
                return 'moderation';

            case 'deleted':
                return 'deleted';

            default:
                return 'my';
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

    getDistrict = (data) => {
        let type = this.props.general.district.find(item => item.id === data.district)
        
        if(type) {
            return type.name;
        }
        else {
            return null;
        }
    }

    setFilter = (name, value) => {
        this.setState({
            filter: {...this.state.filter, [name]: value}
        });
    }

    setGlobalFilter  = (name, value) => {
        let data = {};
        data[name] = value;

        this.props.setSellerFilter(data);
    }

    getFilteredData = (data) => {
        const filterData = this.state.filter;
        const globalFilterData = this.props.seller.filter;
        
        let filter = {
            id: +filterData.id,
            type: +globalFilterData.type,
            rooms: +filterData.rooms,
            priceFrom: parseFloat(filterData.priceFrom),
            priceTo: parseFloat(filterData.priceTo),
            priceM2From: parseFloat(filterData.priceM2From),
            priceM2To: parseFloat(filterData.priceM2To),
            district: +filterData.district,
            floorFrom: +filterData.floorFrom,
            floorTo: +filterData.floorTo,
            squareFrom: parseFloat(filterData.squareFrom),
            squareTo: parseFloat(filterData.squareTo)
        };

        if(filter.id > 0) {
            data = data.filter(item => item.id === filter.id);
        }

        if(filter.type > 0) {
            data = data.filter(item => item.type === filter.type);
        }

        if(filter.rooms >= 0) {
            data = data.filter(item => (filter.rooms === 0 && item.isStudio && item.rooms === 0) || item.rooms === filter.rooms);
        }

        if(filter.priceFrom > 0) {
            data = data.filter(item => item.cost >= filter.priceFrom);
        }

        if(filter.priceTo > 0) {
            data = data.filter(item => item.cost <= filter.priceTo);
        }

        if(filter.priceM2From > 0) {
            data = data.filter(item => item.priceM2 >= filter.priceM2From);
        }

        if(filter.priceM2To > 0) {
            data = data.filter(item => item.priceM2 <= filter.priceM2To);
        }

        if(filter.district > 0) {
            data = data.filter(item => item.district === filter.district);
        }

        if(filter.floorFrom > 0) {
            data = data.filter(item => item.floor >= filter.floorFrom);
        }

        if(filter.floorTo > 0) {
            data = data.filter(item => item.floor <= filter.floorTo);
        }

        if(filter.squareFrom > 0) {
            data = data.filter(item => item.square >= filter.squareFrom);
        }

        if(filter.squareTo > 0) {
            data = data.filter(item => item.square <= filter.squareTo);
        }

        return data;
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
                    data.realtorPrivate !== 1 ?
                        <div style={{marginTop: 5}}>
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

    showLayoutWindow = (id, type) => {
        let images = [];
        let data = this.props.data.find(item => item.id === id);

        if(type === 'photos' && typeof data.photoArray === 'string') {
            data.photoArray.split(',').forEach(item => {
                images.push({ original: 'http://' + Api.getAPIUrl() + '/static/photo/' + data.id + '_' + item + '.png' });
            });
        }
        else if(type === 'layout' && typeof data.layoutArray === 'string') {
            data.layoutArray.split(',').forEach(item => {
                images.push({ original: 'http://' + Api.getAPIUrl() + '/static/layout/' + data.id + '_' + item + '.png' });
            });
        }
        
        this.setState({
            imageGalleryArray: images,
            isImageGalleryShow: true
        }, () => {
            this.imageGallery.fullScreen();
        });

    }

    onGalleryScreenChange = (event) => {
        this.imageGallery.getSnapshotBeforeUpdate = (props, state) => {
            if(!state.isFullscreen && this.state.isImageGalleryShow) {
                this.setState({
                    isImageGalleryShow: false
                });
            }
            else if(state.isFullscreen && !this.state.isImageGalleryShow) {
                this.setState({
                    isImageGalleryShow: true
                });
            }

            return null;
        }
    }

    hideLayoutWindow = (type) => {
        this.setState({
            layoutWindow: {
                ...this.state.layoutWindow,
                isShow: false
            }
        });
    }

    getSellerType = (data) => {
        let type = this.props.general.propertyType.find(item => item.id === data.type)
        
        if(type) {
            return type.name;
        }
        else {
            return null;
        }
    }

    formatDate = (date, epmtyFill = '') => {
        if(!date) {
            return epmtyFill;
        }

        return moment(date).format('DD.MM.YYYY HH:mm:ss');
    }

    selectSeller = (seller) => {
        if (seller) {
            seller._isSelected = !seller._isSelected;

            let selectedObjectsCount = this.props.data.filter(item => item._isSelected).length;

            this.setState({ selectedObjectsCount });
        }
        else {
            const data = this.props.data.map(item => {
                item._isSelected = false;
                return item;
            });

            this.props.updateData(data);
        }
    }
  
    render = () => {
        const user = this.props.user;
        const rowHighlight = this.props.rowHighlight;
        const filterData = this.state.filter;
        const globalFilterData = this.props.seller.filter;
        const state = this.state;
        let data = this.props.data;
        let tableStruct = this.tableStructAll;

        // outer data
        data = data.map(item => {
            return ({
                ...item,
                isSelected: <input onChange={() => this.selectSeller(item)} defaultChecked={!!item._isSelected} type="checkbox"/>,
                info: <span className="seller-short-info">{item.info}</span>,
                object: <span>{ (item.isStudio ? 'Студия' + (item.rooms > 0 ? '+' + item.rooms + 'к' : '') : item.rooms + 'к') }<div>{ this.getSellerType(item) }</div></span>,
                costHTML: <span><div>{ item.cost + 'тр' }</div>{ item.priceM2 + 'тр/м2' }</span>,
                floorHTML: item.floor + '/' + item.floorsCount,
                squareHTML: item.square + ' м2',
                repairs: this.getRepairType(item),
                layout: <span>{ item.photosCount && <span className="link" onClick={() => this.showLayoutWindow(item.id, 'photos')}>{item.photosCount}</span> } / { item.layoutsCount && <span className="link" onClick={() => this.showLayoutWindow(item.id, 'layout')}>{item.layoutsCount}</span>}</span>,
                address: <span><div>{ this.getDistrict(item) }</div>{ item.street + ', ' + item.houseNumber }</span>,
                edit: item.realtor === user.id,
                fullInfo: true,
                deleted: !!item.deleted,
                remove: !!user.isAdmin,
                deleteReason: item.deleted ? (item.deletedType == 0 ? 'Купил(а)' : (item.deletedInfo ? 'Удален с причиной: ' + item.deletedInfo : '')) : null,
                dates: <span>{this.formatDate(item.creationDate, '-')}<br/>{this.formatDate(item.updateDate, '-')}<br/>{this.formatDate(item.deletedTime, '-')}</span>
            });
        });

        // data mode
        let dataMode = this.getMode();
        
        if(dataMode === 'my') {
            tableStruct = this.tableStructMy;
            data = data.filter(item => item.realtor === user.id && item.isChecked && !item.deleted);
        }
        else if(dataMode === 'moderation') {
            tableStruct = this.tableStructModerate;
            data = data.filter(item => (item.realtor === user.id || user.isAdmin) && !item.isChecked && !item.deleted);
        }
        else if(dataMode === 'deleted') {
            tableStruct = this.tableStructDeleted;
            data = data.filter(item => item.deleted);
        }
        else {
            data = data.filter(item => item.isChecked);
        }

        //  filterRoomsList
        let filterRoomsList = new Set();
        data.forEach(item => {
            if(item.rooms > 0) {
                filterRoomsList.add(item.rooms);
            }
        });
        filterRoomsList = Array.from(filterRoomsList);
        filterRoomsList.sort((a, b) => a - b);

        //  filterFloorsList
        let filterFloorsList = new Set();
        data.forEach(item => {
            filterFloorsList.add(item.floor);
        });
        filterFloorsList = Array.from(filterFloorsList);
        filterFloorsList.sort((a, b) => a - b);

        // filter
        if(data && data.length > 0) {
            data = this.getFilteredData(data);
        }
        
        // group by address
        const groupByAddress = (object, item, i) => {
            let isPair = item.id !== object.id && item.district === object.district && item.street === object.street && item.houseNumber === object.houseNumber && item.flatNumber === object.flatNumber;

            if(isPair) {
                if(!data[i].childrens) {
                    data[i].childrens = [Object.assign({}, data[i])];
                }

                data[i].childrens.push(item);
                data[i].edit = false;
                data[i].deleted = false;

                data = data.filter(fItem => fItem.id !== item.id);
            }
        };

        for(let i=0; i<data.length; i++) {
            let object = data[i];

            data.forEach((item) => groupByAddress(object, item, i));
        }
        
        return (
            <div>
                { this.state.sellerFullInfo &&
                    <FullInfo data={this.state.sellerFullInfo} onHide={() => this.setState({ sellerFullInfo: null })}></FullInfo>
                }

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
                            <Link to="./moderation" className={'btn btn-sm ' + (dataMode === 'moderation' ? 'active btn-info' : 'btn-light')}>На модерации</Link>
                            <Link to="./deleted" className={'btn btn-sm ' + (dataMode === 'deleted' ? 'active btn-info' : 'btn-light')}>Удаленные</Link>
                        </div>

                        { state.selectedObjectsCount > 0 &&
                            <div className="btn-group" role="group">
                                <span onClick={() => this.setState({ showOfferWindow: true })} className={'btn btn-sm btn-info inline-block'}>Отправить подборку</span>
                                <span onClick={() => this.selectSeller()} className={'btn btn-sm btn-light inline-block'}>Сбросить</span>
                            </div>
                        }
                        
                        <div className="right-align">
                            <Link to="./create" onClick={this.props.unsetActiveAd} className="btn btn-sm btn-info">+ Новый объект</Link>
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
                                <option value="-1">-</option>
                                <option value="0">Студия</option>
                                {
                                    filterRoomsList.map(item =>
                                        <option key={item} value={item}>{item}к</option>
                                    )
                                }
                            </select>
                        </label>

                        <label>
                            <div className="title">Стоимость т.р.</div>
                            <input className="form-control form-control-sm" style={{width: '70px'}} type="text" value={filterData.priceFrom} onChange={(e) => this.setFilter('priceFrom', e.target.value)} onBlur={(e) => this.setFilter('priceFrom', +e.target.value || 0)}/>
                            -
                            <input className="form-control form-control-sm" style={{width: '70px'}} type="text" value={filterData.priceTo} onChange={(e) => this.setFilter('priceTo', e.target.value)} onBlur={(e) => this.setFilter('priceTo', +e.target.value || 0)}/>
                        </label>

                        <label>
                            <div className="title">Цена т.р. за м2</div>
                            <input className="form-control form-control-sm" style={{width: '70px'}} type="text" value={filterData.priceM2From} onChange={(e) => this.setFilter('priceM2From', e.target.value)} onBlur={(e) => this.setFilter('priceM2From', +e.target.value || 0)}/>
                            -
                            <input className="form-control form-control-sm" style={{width: '70px'}} type="text" value={filterData.priceM2To} onChange={(e) => this.setFilter('priceM2To', e.target.value)} onBlur={(e) => this.setFilter('priceM2To', +e.target.value || 0)}/>
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
                            <div className="title">Этаж</div>
                            <select className="custom-select custom-select-sm" value={filterData.floorFrom} onChange={(e) => this.setFilter('floorFrom', e.target.value)}>
                                <option>-</option>
                                {
                                    filterFloorsList.map(item => 
                                        <option key={item} value={item}>{item}</option>
                                    )
                                }
                            </select>
                            -
                            <select className="custom-select custom-select-sm" value={filterData.floorTo} onChange={(e) => this.setFilter('floorTo', e.target.value)}>
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
                
                    <Table data={data} struct={tableStruct} onAction={this.tableHandler} onMouseMove={this.onTableMouseMove} rowHighlighter={this.rowHighlighter} onMouseLeave={this.onTableMouseLeave} />
                
                    <div className="input-group table-state">
                        <div>
                            <div style={{background: rowHighlight[0]}}></div> Ваши объекты
                        </div>
                        <div>
                            <div style={{background: rowHighlight[2]}}></div> Необходимо отредактировать
                        </div>
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

                { this.state.isImageGalleryShow &&
                    <ImageGallery ref={el => this.imageGallery = el} onScreenChange={this.onGalleryScreenChange} showIndex={true} items={this.state.imageGalleryArray} />
                }

                { this.state.showOfferWindow &&
                    <OfferWindow data={this.props.data} onHide={() => this.setState({ showOfferWindow: false })} unselect={() => this.selectSeller()} />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ user, general, seller, router }) => ({
    user,
    general,
    seller,
    location: router.location
})

const mapDispatchToProps = dispatch =>
bindActionCreators(
{
    unsetActiveAd,
    setActiveSeller,
    setSellerFilter,
    changePage: (page) => push(page)
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SellersMainPage)
