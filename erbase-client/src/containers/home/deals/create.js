import React from 'react'
import { Link } from 'react-router-relative-link';
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'

class DealersCreatePage extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            data: {
                type: "new",
                price: "0.00",
                buyerId: 0,
                buyer: null,
                sellerId: 0,
                seller: null,
                sellerName: "",
                reserved: false,
                bank: "1"
            }
        };
    }

    componentDidMount () {
        if(this.props.isEdit) {
            let activeDeal = this.props.deal.data;
            
            this.setState({
                data: {
                    ...this.state.data,
                    ...activeDeal,
                    reserved: Boolean(activeDeal.reserved)
                }
            }, () => {
                this.getBuyer();

                if(activeDeal.type === 'secondary') {
                    this.getSeller();
                } 
            });
        }
    }

    save = (e) => {
        e.preventDefault();
        let data = this.state.data;

        let deal = {
            id: +data.id,
            type: data.type,
            price: +data.price,
            buyerId: +data.buyerId,
            sellerId: 0,
            sellerName: "",
            bank: +data.bank,
            reserved: +data.reserved
        };

        if(data.type === 'new') {
            deal.sellerName = data.sellerName;
        }
        else {
            deal.sellerId = data.sellerId;
        }

        if(this.props.onDealCreated) {
            this.props.onDealCreated(deal, this.props.isEdit);
        }
    }

    getBuyer = () => {
        let id = this.state.data.buyerId;

        if(id === 0) {
            this.setState({ data: {...this.state.data, buyer: null} });
            return;
        }

        Api.get('/buyers/' + id)
        .then(out => {
            if(out && out.id > 0) {
                this.setState({ data: {...this.state.data, buyer: out} });
            }
            else {
                this.setState({ data: {...this.state.data, buyer: null} });
            }
        });
    }

    getSeller = () => {
        let id = this.state.data.sellerId;

        if(id === 0) {
            this.setState({ data: {...this.state.data, seller: null} });
            return;
        }

        Api.get('/sellers/' + id)
        .then(out => {
            if(out && out.id > 0) {
                this.setState({ data: {...this.state.data, seller: out} });
            }
            else {
                this.setState({ data: {...this.state.data, seller: null} });
            }
        });
    }

    setData = (name, value) => {
        let state = Object.assign({}, this.state);

        state.data[name] = value;
        this.setState(state);
    }
    
    render = () => {
        const data = this.state.data;
        
        return (
            <form className="as-row deals" onSubmit={this.save}>
                <div>
                    <div className="input-group">
                        <label>
                            <div className="title required">Тип сделки</div>
                            <div className="value">
                                <select className="custom-select custom-select-sm" value={data.type} onChange={(e) => this.setData('type', e.target.value)}>
                                    <option value="new">Новостройка</option>
                                    <option value="secondary">Вторичное</option>
                                </select>
                            </div>
                        </label>

                        <label>
                            <div className="title required">Стоимость квартиры</div>
                            <div className="value">
                                <input className="form-control form-control-sm" type="text" value={data.price} onChange={(e) => this.setData('price', e.target.value)} onBlur={(e) => this.setData('price', (+e.target.value || 0).toFixed(2))}/> т.р.
                            </div>
                        </label>
                    </div>

                    <div className="hr"></div>

                    <div className="input-group">
                        <label>
                            <div className="title required">ID покупателя</div>
                            <div className="value">
                                <input className="form-control form-control-sm" type="number" value={data.buyerId} onChange={(e) => this.setData('buyerId', (parseInt(e.target.value) || 0))} onBlur={this.getBuyer}/>
                                <div className="small-text">{(data.buyer ? 'Покупатель: ' + data.buyer.name : null)}</div>
                                {
                                    data.buyer ?
                                        <div className="agencyInfo">
                                            <div>{data.buyer.realtorAgency}</div>
                                            <div className="hr"></div>
                                            <div>Риэлтор: {data.buyer.realtorName}</div>
                                            <div>тел. {data.buyer.realtorPhoneNumber}</div>
                                            <div>email: {data.buyer.realtorEmail}</div>
                                        </div>
                                    :
                                    null
                                }
                            </div>
                        </label>

                        {
                            data.type === 'new' ?
                                <label>
                                    <div className="title required">Объект</div>
                                    <div className="value">
                                        <input className="form-control form-control-sm" type="text" value={data.sellerName} onChange={(e) => this.setData('sellerName', e.target.value)}/>
                                    </div>
                                </label>
                            :
                                <label>
                                    <div className="title required">ID объекта</div>
                                    <div className="value">
                                        <input className="form-control form-control-sm" type="number"  value={data.sellerId} onChange={(e) => this.setData('sellerId', (parseInt(e.target.value) || 0))} onBlur={this.getSeller}/>
                                        <div className="small-text">{(data.seller ? 'Покупатель: ' + data.seller.name : null)}</div>
                                        {
                                            data.seller ?
                                                <div className="agencyInfo">
                                                    <div>{data.seller.realtorAgency}</div>
                                                    <div className="hr"></div>
                                                    <div>Риэлтор: {data.seller.realtorName}</div>
                                                    <div>тел. {data.seller.realtorPhoneNumber}</div>
                                                    <div>email: {data.seller.realtorEmail}</div>
                                                </div>
                                            :
                                            null
                                        }
                                    </div>
                                </label>
                        }
                    </div>

                    <div className="input-group">
                        <label>
                            <div className="title required">Источник финансирования</div>
                            <div className="value">
                                <select className="custom-select custom-select-sm" value={data.bank} onChange={(e) => this.setData('bank', e.target.selectedOptions[0].value)}>
                                    {
                                        this.props.general.banks.map(item => 
                                            <option value={item.id} key={item.id}>{item.name}</option>
                                        )
                                    }
                                </select>
                            </div>
                        </label>
                    </div>

                    <div className="input-group">
                        <label>
                            <div className="title required">Задаток или бронь оформлена</div>
                            <div className="value">
                                <input type="checkbox" checked={data.reserved} onChange={(e) => this.setData('reserved', e.target.checked)}/>
                            </div>
                        </label>
                    </div>

                    <div className="input-group btn-group">
                        <button className="btn btn-sm btn-success">Сохранить</button>
                        <Link to=".." className="btn btn-sm btn-danger">Отменить</Link>
                    </div>
                </div>
            </form>
        )
    }
}

const mapStateToProps = ({ user, general, deal, router }) => ({
    user,
    general,
    deal,
    location: router.location
})

const mapDispatchToProps = dispatch =>
bindActionCreators(
{
    changePage: (page) => push(page)
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DealersCreatePage)
