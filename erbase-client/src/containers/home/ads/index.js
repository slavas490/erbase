import React from 'react'
import { push } from 'connected-react-router'
import { Link } from 'react-router-relative-link'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import { Table, Field, SortableField, FieldType } from '../table'
import { setActiveAd } from '../../../modules/user'
import moment from 'moment'

class Ads extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            data: [],
            mode: 'active',
            filter: {
                id: '',
                title: '',
                address: '',
                priceFrom: '0.00',
                priceTo: '0.00'
            }
        };

        this.tableStruct = {
            all: [SortableField(FieldType.INTEGER, 'id', '№'),
                SortableField(FieldType.STRING, 'creationDate', 'Дата создания'),
                SortableField(FieldType.LINK, 'title', 'Заголовок', ['linkText', 'link']),
                SortableField(FieldType.STRING, 'address', 'Адрес'),
                SortableField(FieldType.FLOAT, 'price', 'Стоимость'),
                SortableField(FieldType.STRING, 'phone', 'Телефон'),
                SortableField(FieldType.BOOLEAN, 'isRealtor', '', ['Риэлтор', null]),
                Field(FieldType.BUTTON, '!isActive', 'В работу')],

            active :[SortableField(FieldType.INTEGER, 'id', '№'),
                SortableField(FieldType.STRING, 'creationDate', 'Дата создания'),
                SortableField(FieldType.LINK, 'title', 'Заголовок', ['linkText', 'link']),
                SortableField(FieldType.STRING, 'address', 'Адрес'),
                SortableField(FieldType.FLOAT, 'price', 'Стоимость'),
                SortableField(FieldType.STRING, 'phone', 'Телефон'),
                Field(FieldType.TEXTAREA, 'comment', 'Комментарий'),
                Field(FieldType.BUTTON, '!inBase', 'В базу'),
                Field(FieldType.BUTTON, '!cancel', 'Отказаться')
            ]
        };
    }

    componentDidMount = () => {
        this.getAds();
    }

    getAds = () => {
        Api.get('/ads')
        .then(data => {
            this.setState({ data: data.value || [] });
        });
    }

    formatDate = (date, epmtyFill = '') => {
        if(!date) {
            return epmtyFill;
        }

        return moment(date).format('DD.MM.YYYY HH:mm:ss');
    }

    tableHandler = (action, value) => {
        let state = Object.assign({}, this.state);
        let ad = this.state.data.find(item => item.id === value);

        switch (action) {
            case 'isActive':
                this.setActive(value);
                break;

            case 'inBase':
                if(ad) {
                    this.props.setActiveAd(ad);
                    this.props.changePage('/sellers/create');
                }

                break;

            case 'cancel':
                if(ad) {
                    Api.delete('/ads/active/' + ad.id)
                    .then(out => {
                        this.getAds();
                    });
                }

                break;

            case 'comment:onChange':
                ad = state.data.find(item => item.id === value.id);

                if(ad) {
                    ad.comment = value.event.value;
                    this.setState(state);
                }

                break;

            case 'comment:onBlur':
                ad = state.data.find(item => item.id === value.id);

                if(ad) {
                    Api.put('/ads/' + ad.id, { data: value.event.value });
                }

                break;

            default:
                break;
        }
    }

    rowHighlighter = (data) => {
        if (this.getMode() !== 'all') {
            return null;
        }
        else if (data.isActive) {
            return this.props.rowHighlight[0];
        }
        else if (data.isRealtor) {
            return this.props.rowHighlight[2];
        }
    }

    getMode = () => {
        const location = this.props.location;
        let pathname = location.pathname.split('/'), dataMode = 'all';

        if(pathname[pathname.length - 1] !== 'all') {
            dataMode = 'my';
        }

        return dataMode;
    }

    setActive (id) {
        Api.put('/ads/active/' + id)
        .then(out => {
            if(!out.error) {
                this.getAds();
            }
        });
    }

    setFilter = (name, value) => {
        this.setState({
            filter: {...this.state.filter, [name]: value}
        });
    }

    getFilteredData = (data) => {
        const filterData = this.state.filter;
        
        let filter = {
            id: +filterData.id,
            title: filterData.title ? filterData.title + '' : '',
            address: filterData.address ? filterData.address + '' : '',
            phoneNumber: filterData.phoneNumber ? filterData.phoneNumber + '' : '',
            priceFrom: parseFloat(filterData.priceFrom),
            priceTo: parseFloat(filterData.priceTo)
        };
        
        if(filter.id > 0) {
            data = data.filter(item => item.id === filter.id);
        }

        if(filter.title.length > 0) {
            data = data.filter(item => item.title.toLocaleUpperCase().indexOf(filter.title.toLocaleUpperCase()) !== -1);
        }

        if(filter.address.length > 0) {
            data = data.filter(item => item.address.toLocaleUpperCase().indexOf(filter.address.toLocaleUpperCase()) !== -1);
        }

        if(filter.phoneNumber.length > 0) {
            data = data.filter(item => item.phone.indexOf(filter.phoneNumber) !== -1);
        }

        if(filter.priceFrom > 0) {
            data = data.filter(item => item.price >= filter.priceFrom);
        }

        if(filter.priceTo > 0) {
            data = data.filter(item => item.price <= filter.priceTo);
        }

        return data;
    }
    
    render = () => {
        const rowHighlight = this.props.rowHighlight;
        const state = this.state;
        const filterData = this.state.filter;
        let data = state.data;
        let tableStruct = this.tableStruct.all;

        // data mode
        let dataMode = this.getMode();
        
        if(dataMode === 'my') {
            data = data.filter(item => item.isActive);
            tableStruct = this.tableStruct.active;
        }

        // filter
        if(data && data.length > 0) {
            data = this.getFilteredData(data);
        }

        // outer data
        data = data.map(item => {
            return {
                ...item,
                linkText: item.title,
                link: 'http://avito.ru' + (item.link[0] !== '/' ? '/' : '') + item.link,
                inBase: false,
                cancel: false,
                isActive: !!item.isActive,
                creationDate: this.formatDate(item.creationDate)
            }
        });

        return (
            <div className="row">
                <div className="btn-group" role="group">
                    <Link to="/" className={'btn btn-sm ' + (dataMode === 'my' ? 'active btn-info' : 'btn-light')}>Мои</Link>
                    <Link to="/all" className={'btn btn-sm ' + (dataMode === 'all' ? 'active btn-info' : 'btn-light')}>Все</Link>
                </div>

                <div className="hr"></div>

                <div className="input-group">
                    <label>
                        <div className="title">№</div>
                        <input className="form-control form-control-sm" style={{width: '70px'}} type="text" value={filterData.id} onChange={(e) => this.setFilter('id', (+e.target.value || 0))}/>
                    </label>

                    <label>
                        <div className="title">Заголовок</div>
                        <input className="form-control form-control-sm" type="text" value={filterData.title} onChange={(e) => this.setFilter('title', e.target.value)}/>
                    </label>

                    <label>
                        <div className="title">Адрес</div>
                        <input className="form-control form-control-sm" type="text" value={filterData.address} onChange={(e) => this.setFilter('address', e.target.value)}/>
                    </label>

                    <label>
                        <div className="title">Стоимость</div>
                        <input className="form-control form-control-sm" style={{width: '100px'}} type="text" value={filterData.priceFrom} onChange={(e) => this.setFilter('priceFrom', e.target.value)} onBlur={(e) => this.setFilter('priceFrom', (+e.target.value || 0).toFixed(2))}/>
                        -
                        <input className="form-control form-control-sm" style={{width: '100px'}} type="text" value={filterData.priceTo} onChange={(e) => this.setFilter('priceTo', e.target.value)} onBlur={(e) => this.setFilter('priceTo', (+e.target.value || 0).toFixed(2))}/>
                    </label>

                    <label>
                        <div className="title">Телефон</div>
                        <input className="form-control form-control-sm" type="text" value={filterData.phoneNumber} onChange={(e) => this.setFilter('phoneNumber', e.target.value)}/>
                    </label>
                </div>
            
                <Table data={data} struct={tableStruct} onAction={this.tableHandler} rowHighlighter={this.rowHighlighter} />

                <div className="input-group table-state">
                    <div>
                        <div style={{background: rowHighlight[0]}}></div> В работе
                    </div>

                    <div>
                        <div style={{background: rowHighlight[2]}}></div> Риэлтор
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = ({ user, router }) => ({
    user,
    location: router.location
})

const mapDispatchToProps = dispatch =>
bindActionCreators(
{
    setActiveAd,
    changePage: (page) => push(page)
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Ads)
