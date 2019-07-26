import React from 'react'
import { Link } from 'react-router-relative-link'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import swal from 'sweetalert'

class SellersCreatePage extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            data: {
                isStudio: 0,
                type: 1,
                userName: "",
                phoneNumber: "+7",
                email: "",
                rooms: 0,
                repairs: 1,
                district: 1,
                street: "",
                houseNumber: "",
                floor: 0,
                floorsCount: 0,
                flatNumber: "",
                builtYear: new Date().getFullYear(),
                info: "",
                cost: "0",
                square: "0.00"
            },
            files: {
                CFS: null,
                layout: null,
                photo: null
            },
            activeAd: null,
            streetSearchBox: {
                show: false,
                selectedId: 0
            }
        };
    }

    componentDidMount () {
        let activeAd = this.props.user.activeAd;
        
        if(this.props.isEdit) {
            let activeSeller = this.props.seller.data;
            
            this.setState({
                data: {
                    ...this.state.data,
                    ...activeSeller,
                    userName: activeSeller.name || ''
                },
                streetSearchBox: {
                    ...this.state.streetSearchBox,
                    selectedId: -1
                }
            });
        }
        else if(activeAd) {
            this.setState({
                activeAd,
                data: {
                    ...this.state.data,
                    phoneNumber: activeAd.phone
                }
            });
        }
    }

    errorMsg = (msg) => {
        swal({ text: msg, icon: 'error', button: 'Ок' });
    }

    save = (e) => {
        e.preventDefault();

        let data = Object.assign({}, this.state.data);
        let files = Object.assign({}, this.state.files);
        
        data.priceM2 = (data.cost / data.square || 0).toFixed(2);
        data.isStudio = +data.isStudio;
        data.rooms = +data.rooms || 0;

        if(!data.type || !data.userName || (!data.rooms && !data.isStudio) || !data.repairs || !data.district || !data.houseNumber || !data.floor || !data.floorsCount || !data.builtYear || !data.cost || !data.square) {
            this.errorMsg('Все поля необходимы для заполнения!');
        }
        else if(!this.state.streetSearchBox.selectedId) {
            this.errorMsg('Необходимо выбрать улицу из выпадающего списка!');
        }
        else if(!/^\+7[0-9]{10}$/.test(data.phoneNumber)) {
			this.errorMsg('Номер телефона необходимо указывать начиная с +7 и 10 цифр');
        }
        else if(!/^[0-9]{4}$/.test(data.builtYear)) {
            this.errorMsg('Год постройки необходимо указывать в формате хххх!');
        }
        else if(!/^[0-9]{1,6}$/.test(data.cost)) {
            this.errorMsg('Стоимость может содержать до 6 цифр!');
        }
        else if(this.props.onUserCreated) {
            this.props.onUserCreated({ data, files }, this.props.isEdit);
        }
    }

    removeImage = (type, id) => {
        swal({ title: "Вы уверены?", icon: "warning", buttons: ["Нет", "Да"] })
        .then((ok) => {
            if(ok) {
                Api.delete('/sellers/image/' + type + '/' + id)
                .then(() => {
                    let data = this.state.data;

                    if(type === 'photo') {
                        let photo = data.photoArray.split(',');
                        photo = photo.filter(item => +item !== id);

                        this.setState({
                            data: {
                                ...this.state.data,
                                photoArray: photo.join(',')
                            }
                        });
                    }
                    else if(type === 'layout') {
                        let layout = data.layoutArray.split(',');
                        layout = layout.filter(item => +item !== id);
                        
                        this.setState({
                            data: {
                                ...this.state.data,
                                layoutArray: layout.join(',')
                            }
                        });
                    }
                })
                .catch(() => {});
            }
        });
    }

    setData = async (name, value) => {
        let state = Object.assign({}, this.state);

        state.data[name] = value;

        if(name === 'street') {
            if(value && value.length > 0) {
                await Api.get('/geo/street?name=' + value)
                .then(out => {
                    state.streetSearchBox = {
                        show: true,
                        data: out.value,
                        selectedId: 0
                    }
                })
                .catch(() => {});
            }
            else {
                state.streetSearchBox = {
                    show: false,
                    selectedId: 0
                }
            }
        }

        this.setState(state);
    }

    setFile = (name, value) => {
        let state = Object.assign({}, this.state);
        
        state.files[name] = (value && value.length === 0 ? null : value);
        this.setState(state);
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

    confirmSeller = (e) => {
        e.preventDefault();
        const data = this.state.data;

        Api.put('sellers/confirm/' + data.id)
        .then(() => {
            swal({ title: "Успешно", icon: "success", button: "Ок" });
            this.props.changePage('/sellers/moderation');
        })
        .catch(error => {
            this.errorMsg(error);
        });
    }

    revisionSeller = (e) => {
        e.preventDefault();
        const data = this.state.data;

        Api.put('/sellers/revision/' + data.id, { data: data.revisionComment })
        .then(() => {
            swal({ title: "Успешно", icon: "success", button: "Ок" });
            this.props.changePage('/sellers/moderation');
        })
        .catch(error => {
            this.errorMsg(error);
        });
    }

    //#region StreetSearchBox

    selectStreetSearchBox = (id, title) => {
        this.setState({
            streetSearchBox: {
                show: false,
                selectedId: id
            },
            data: {
                ...this.state.data,
                street: title
            } 
        });
    }

    //#endregion

    render = () => {
        let data = this.state.data;
        const streetSearchBox = this.state.streetSearchBox;
        const user = this.props.user;
        const isModerateMode = data.id && !data.isChecked && user.isAdmin;
        
        return (
            <>
                { data.revisionComment && !user.isAdmin && <div class="alert alert-danger">{data.revisionComment}</div> }

                <form className="as-row" onSubmit={this.save}>
                {
                    (!isModerateMode || data.realtor === user.id) &&
                    <div className="vr">
                        <label>
                            <div className="title required">Тип недвижимости</div>
                            <div className="value">
                                <select className="custom-select custom-select-sm" value={data.type} onChange={(e) => this.setData('type', e.target.checked)}>
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
                            <div className="title required">ФИО продавца</div>
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

                        <label>
                            <div className="title">Договор на оказание услуг</div>
                            <div className="value">
                                <input type="file" multiple onChange={(e) => this.setFile('CFS', e.target.files)} style={{width: '192px'}} />
                            </div>
                        </label>
                    </div>
                }

                    <div className="vr">
                        <div className="input-group">
                            <label>
                                <div className="title">Студия</div>
                                <div className="value">
                                    <input type="checkbox" checked={data.isStudio} onChange={(e) => this.setData('isStudio', +e.target.checked)}/>
                                </div>
                            </label>
                            
                            <label>
                                <div className={"title" + (!data.isStudio ? " required" : "")}>Количество комнат</div>
                                <div className="value">
                                    <input className="form-control form-control-sm" type="number" value={data.rooms} onChange={(e) => this.setData('rooms', parseInt(e.target.value) || 0)}/>
                                </div>
                            </label>

                            <label>
                                <div className="title required">Ремонт</div>
                                <div className="value">
                                    <select className="custom-select custom-select-sm" value={data.repairs} onChange={(e) => this.setData('repairs', parseInt(e.target.value))}>
                                        { this.props.general.repairType.map(item => <option value={item.id} key={item.id}>{item.name}</option>) }
                                    </select>
                                </div>
                            </label>
                        </div>
                    
                        { this.state.activeAd && <div className="seller-address">Адрес: {this.state.activeAd.address}</div> }

                        <div className="input-group">
                            <label>
                                <div className="title required">Район</div>
                                <div className="value">
                                <select className="custom-select custom-select-sm" value={data.district} onChange={(e) => this.setData('district', parseInt(e.target.value))}>
                                        { this.props.general.district.map(item => <option value={item.id} key={item.id}>{item.name}</option>) }
                                    </select>
                                </div>
                            </label>

                            <label>
                                <div className="title required">Улица</div>
                                <div className="value">
                                    <input className="form-control form-control-sm" type="text" value={data.street} onChange={(e) => this.setData('street', e.target.value)}/>
                                    { streetSearchBox.show && streetSearchBox.data &&
                                        <ul className="searchingBox">
                                        {
                                            streetSearchBox.data.map(item =>
                                                <li key={item.id} onClick={() => this.selectStreetSearchBox(item.id, item.title)}>{item.title}</li>
                                            )
                                        }
                                        </ul>
                                    }
                                </div>
                            </label>

                            <label>
                                <div className="title required">Дом</div>
                                <div className="value">
                                    <input className="form-control form-control-sm" type="text" value={data.houseNumber} onChange={(e) => this.setData('houseNumber', e.target.value)}/>
                                </div>
                            </label>

                            { !isModerateMode && 
                                <label>
                                    <div className="title">Квартира</div>
                                    <div className="value">
                                        <input className="form-control form-control-sm" type="text" value={data.flatNumber} onChange={(e) => this.setData('flatNumber', e.target.value)}/>
                                    </div>
                                </label>
                            }
                        </div>

                        <div className="input-group">
                            <label>
                                <div className="title required">Этаж</div>
                                <div className="value">
                                    <input className="form-control form-control-sm" type="number" value={data.floor} onChange={(e) => this.setData('floor', parseInt(e.target.value))}/> из <input className="form-control form-control-sm" type="number" value={data.floorsCount} onChange={(e) => this.setData('floorsCount', parseInt(e.target.value))}/>
                                </div>
                            </label>

                            <label>
                                <div className="title required">Год постройки</div>
                                <div className="value">
                                    <input className="form-control form-control-sm" type="number" value={data.builtYear} onChange={(e) => this.setData('builtYear', parseInt(e.target.value))} onBlur={(e) => this.validateData('builtYear', /^[0-9]{4}$/, parseInt(e.target.value), 'Год постройки необходимо указывать в формате хххх!')} />
                                </div>
                            </label>
                        </div>

                        <div className="input-group">
                            <label>
                                <div className="title required">Стоимость т.р.</div>
                                <div className="value">
                                    <input className="form-control form-control-sm" type="text" value={data.cost} onChange={(e) => this.setData('cost', e.target.value)} onBlur={(e) => this.validateData('cost', /^[0-9]{1,4}$/, parseInt(e.target.value), 'Стоимость может содержать до 4 цифр!')}/>
                                </div>
                            </label>

                            <label>
                                <div className="title required">Площадь м2</div>
                                <div className="value">
                                    <input className="form-control form-control-sm" type="text" value={data.square} onChange={(e) => this.setData('square', e.target.value)} onBlur={(e) => this.setData('square', (+e.target.value || 0).toFixed(2))}/>
                                </div>
                            </label>
                        </div>
                    
                        <div className="input-group">
                            <div>
                                <label>
                                    <div className="title">Планировка</div>
                                    <div className="value">
                                        <input type="file" multiple onChange={(e) => this.setFile('layout', e.target.files)}/>
                                    </div>
                                </label>
                                <div className="photoPrev">
                                    { typeof data.layoutArray === 'string' && data.layoutArray.length > 0 &&
                                        data.layoutArray.split(',').map(item =>
                                            <div style={{backgroundImage: 'url(http://' + Api.getAPIUrl() + ':8080/static/layout/' + data.id + '_' + item + '.png)'}}>
                                                <div className="close" onClick={() => this.removeImage('layout', item)}>x</div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>

                            <div>
                                <label>
                                    <div className="title">Фото</div>
                                    <div className="value">
                                        <input type="file" className="custom-file-input custom-file-input-sm" multiple onChange={(e) => this.setFile('photo', e.target.files)}/>
                                    </div>
                                </label>
                                <div className="photoPrev">
                                    { typeof data.photoArray === 'string' && data.photoArray.length > 0 &&
                                        data.photoArray.split(',').map(item =>
                                            <div style={{backgroundImage: 'url(http://' + Api.getAPIUrl() + ':8080/static/photo/' + data.id + '_' + item + '.png)'}}>
                                                <div className="close" onClick={() => this.removeImage('photo', item)}>x</div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    
                        <div className="input-group">
                            <label>
                                <div className="title">Описание объекта</div>
                                <div className="value">
                                    <textarea className="form-control form-control-sm" onChange={(e) => this.setData('info', e.target.value)} value={data.info}/>
                                </div>
                            </label>

                            {
                                user.isAdmin === true &&
                                <label>
                                    <div className="title">Комментарий модератора</div>
                                    <div className="value">
                                        <textarea className="form-control form-control-sm" onChange={(e) => this.setData('revisionComment', e.target.value)} value={data.revisionComment}/>
                                    </div>
                                </label>
                            }
                        </div>

                        {
                            user.isAdmin &&
                            <div className="input-group btn-group">
                                <label>
                                    <div className="title">Объеденить с объектом id:</div>
                                    <div className="value">
                                        <input type="text" className="form-control form-control-sm" onChange={(e) => this.setData('combineId', e.target.value)} value={data.combineId}/>
                                    </div>
                                </label>
                            </div>
                        }

                        <div className="input-group btn-group">
                        {
                            (!this.props.isEdit || data.realtor === user.id) &&
                            <>
                                <button className="btn btn-sm btn-info">Сохранить</button>
                                { (!user.isAdmin || !this.props.isEdit) && <Link to=".." className="btn btn-sm btn-danger">Отменить</Link> }
                            </>
                        }
                        {
                            (this.props.isEdit && user.isAdmin)
                            ?
                                <>
                                    <button className="btn btn-sm btn-success" onClick={this.confirmSeller}>Подтвердить</button>
                                    <button className="btn btn-sm btn-warning" onClick={this.revisionSeller}>На доработку</button>
                                    <Link to=".." className="btn btn-sm btn-danger">Отменить</Link>
                                </>
                            :
                                null
                        }
                        </div>
                    </div>
                </form>
            </>
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
    changePage: (page) => push(page)
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SellersCreatePage)
