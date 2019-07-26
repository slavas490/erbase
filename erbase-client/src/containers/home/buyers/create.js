import React from 'react'
import { Link } from 'react-router-relative-link'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import swal from 'sweetalert'

class BuyersCreatePage extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            data: {
                type: 1,
                costFrom: "0",
                costTo: "0",
                email: "",
                floorFrom: 0,
                floorTo: 0,
                houseNumber: "",
                info: "",
                phoneNumber: "+7",
                rooms: 0,
                square: "0.00",
                street: "",
                userName: "",
                district: '1'
            }
        };
    }

    componentDidMount () {
        if(this.props.isEdit) {
            let activeBuyer = this.props.buyer.data;
            
            this.setState({
                data: {
                    ...this.state.data,
                    ...activeBuyer,
                    userName: activeBuyer.name || ''
                }
            });
        }
    }

    errorMsg = (msg) => {
        swal({ text: msg, icon: 'error', button: 'Ок' });
    }

    validateData = (name, regexp, value, errorText) => {
        if(regexp.test(value)) {
            let state = Object.assign({}, this.state)

            state.data[name] = value;
            this.setState(state);
        }
        else {
            this.errorMsg(errorText);
        }
    }

    save = (e) => {
        e.preventDefault();

        let data = Object.assign({}, this.state.data);
        
        if(!data.type || !data.userName || !data.rooms || !data.district || !data.costFrom || !data.costTo || parseFloat(data.square) === 0) {
            this.errorMsg('Все поля необходимы для заполнения!');
        }
        else if(!/^\+7[0-9]{10}$/.test(data.phoneNumber)) {
			this.errorMsg('Номер телефона необходимо указывать начиная с +7 и 10 цифр');
        }
        else if(!/^[0-9]{1,4}$/.test(data.costFrom) || !/^[0-9]{1,4}$/.test(data.costTo)) {
            this.errorMsg('Стоимость может содержать до 4 цифр!');
        }
        else if(this.props.onUserCreated) {
            this.props.onUserCreated(data, this.props.isEdit);
        }
    }

    setData = (name, value) => {
        let state = Object.assign({}, this.state);
        
        if(name === 'district') {
            let out = [];
            for(let i=0; i<value.length; i++) {
                out.push(value[i].value);
            }
            value = out.join(',');
        }
        
        state.data[name] = value;
        this.setState(state);
    }
    
    render = () => {
        let data = this.state.data;

        return (
            <form className="as-row" onSubmit={this.save}>
                <div className="vr">
                    <label>
                        <div className="title required">Тип недвижимости</div>
                        <div className="value">
                            <select className="custom-select custom-select-sm" value={data.type} onChange={(e) => this.setData('type', parseInt(e.target.value))}>
                                { this.props.general.propertyType.map(item => <option value={item.id} key={item.id}>{item.name}</option>) }
                            </select>
                        </div>
                    </label>

                    <label>
                        <div className="title required">Статус</div>
                        <div className="value">
                            <select className="custom-select custom-select-sm" value={data.deleted} onChange={(e) => this.setData('deleted', e.target.value)}>
                                <option value="0">Активен</option>
                                <option value="1">Удален</option>
                            </select>
                        </div>
                    </label>

                    <label>
                        <div className="title required">ФИО покупателя</div>
                        <div className="value">
                            <input className="form-control form-control-sm" type="text" value={data.userName} onChange={(e) => this.setData('userName', e.target.value)}/>
                        </div>
                    </label>

                    <label>
                        <div className="title">Телефон клиента</div>
                        <div className="value">
                            <input className="form-control form-control-sm" type="text" value={data.phoneNumber} onChange={(e) => this.setData('phoneNumber', e.target.value)}/>
                        </div>
                    </label>

                    <label>
                        <div className="title">Email</div>
                        <div className="value">
                            <input className="form-control form-control-sm" type="text" value={data.email} onChange={(e) => this.setData('email', e.target.value)}/>
                        </div>
                    </label>
                </div>

                <div className="vr">
                    <div className="input-group">
                        <label>
                            <div className="title required">Количество комнат</div>
                            <div className="value">
                                <input className="form-control form-control-sm" type="text" value={data.rooms} onChange={(e) => this.setData('rooms', parseInt(e.target.value))}/>
                            </div>
                        </label>
                    </div>
                
                    <div className="input-group">
                        <label>
                            <div className="title required">Район</div>
                            <div className="value">
                                <select className="custom-select custom-select-sm" size="5" style={{height: 100}} multiple value={data.district} onChange={(e) => this.setData('district', e.target.selectedOptions)}>
                                    { this.props.general.district.map(item => <option value={item.id} key={item.id}>{item.name}</option>) }
                                </select>
                            </div>
                        </label>

                        <label>
                            <div className="title">Улица</div>
                            <div className="value">
                                <input className="form-control form-control-sm" type="text" value={data.street} onChange={(e) => this.setData('street', e.target.value)}/>
                            </div>
                        </label>

                        <label>
                            <div className="title">Дом</div>
                            <div className="value">
                                <input className="form-control form-control-sm" type="text" value={data.houseNumber} onChange={(e) => this.setData('houseNumber', e.target.value)}/>
                            </div>
                        </label>
                    </div>

                    <div className="input-group">
                        <label>
                            <div className="title required">Стоимость т.р.</div>
                            <div className="value">
                                <input className="form-control form-control-sm" type="text" value={data.costFrom} onChange={(e) => this.setData('costFrom', e.target.value)} onBlur={(e) => this.validateData('costFrom', /^[0-9]{1,4}$/, parseInt(e.target.value), 'Стоимость может содержать до 4 цифр!')}/>
                                 - 
                                <input className="form-control form-control-sm" type="text" value={data.costTo} onChange={(e) => this.setData('costTo', e.target.value)} onBlur={(e) => this.validateData('costTo', /^[0-9]{1,4}$/, parseInt(e.target.value), 'Стоимость может содержать до 4 цифр!')}/>
                            </div>
                        </label>
                    </div>

                    <div className="input-group">
                        <label>
                            <div className="title required">Площадь м2</div>
                            <div className="value">
                                <input style={{width: 70}} className="form-control form-control-sm" type="text" value={data.square} onChange={(e) => this.setData('square', e.target.value)} onBlur={(e) => this.setData('square', (+e.target.value || 0).toFixed(2))}/>
                            </div>
                        </label>

                        <label>
                            <div className="title">Этаж (от - до)</div>
                            <div className="value">
                                <input style={{width: 70}} className="form-control form-control-sm" type="number" value={data.floorFrom} onChange={(e) => this.setData('floorFrom', parseInt(e.target.value))}/>
                                 - 
                                <input style={{width: 70}} className="form-control form-control-sm" type="number" value={data.floorTo} onChange={(e) => this.setData('floorTo', parseInt(e.target.value))}/>
                            </div>
                        </label>
                    </div>
                
                    <div className="input-group">
                        <label>
                            <div className="title">Уточнения по потребности</div>
                            <div className="value">
                                <textarea className="form-control form-control-sm" onChange={(e) => this.setData('info', e.target.value)} value={data.info}/>
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

const mapStateToProps = ({ user, general, buyer, router }) => ({
    user,
    general,
    buyer,
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
)(BuyersCreatePage)
