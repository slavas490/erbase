import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../../utils/api'
import swal from 'sweetalert'
import sha256 from 'sha256'

class ProfileMainPage extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            isUserEdit: false,
            user: {},
            dataChanged: false
        };
    }

    componentDidMount () {
        this.initializeUser();
    }

    initializeUser = () => {
        let user = this.props.user;

        this.setState({
            user: {
                ...user,
                agency: this.getUserAgency(user),
                private: Boolean(user.private),
                password: '',
                passwordRepeat: ''
            },
            dataChanged: false
        });
    }

    getUserAgency = (user) => {
        let agency = this.props.general.agency.find(item => item.id === user.agencyId);

        if(agency && agency.id) {
            return agency.name;
        }
        else {
            return user.agency;
        }
    }

    getUserSpecialize = (user) => {
        let specialize = this.props.general.specialize.find(item => item.id === user.specialize);
        
        if(specialize && specialize.id) {
            return specialize.name;
        }
        else {
            return '-';
        }
    }

    resetUserData = (event) => {
        this.setState({ isUserEdit: false });
        this.initializeUser();
    }

    setData = (name, value) => {
        let state = Object.assign({}, this.state);
        
        state.user[name] = value;
        state.dataChanged = true;

        this.setState(state);
    }

    saveUser = (event) => {
        if(!this.state.dataChanged) {
            return;
        }

        const user = this.state.user;

        let data = {
            agency: user.agency,
            email: user.email,
            hasCar: +user.hasCar,
            name: user.name,
            phone: user.phone,
            phoneChief: user.phoneChief,
            private: +user.private,
            specialize: user.specialize
        }

        Api.put('/user', data)
        .then(out => {
            this.props.getUserInfo();
            swal({ title: "Успешно", icon: "success", button: "Ок" });
        })
        .catch(out => {
            swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
        });
    }

    saveAuthorizationData = (event) => {
        const user = this.state.user;

        if(!user.password) {
            return;
        }

        let data = {
            password: sha256(user.password)
        };

        if(user.password.length < 6) {
            swal({ title: "Произошла ошибка", text: "Минимальная длина пароля 6 символов", icon: "error", button: "Ок" });
        }
        else if(user.password !== user.passwordRepeat) {
            swal({ title: "Произошла ошибка", text: "Повторение пароля не совпадает", icon: "error", button: "Ок" });
        }
        else {
            Api.put('/user/authentication', data)
            .then(out => {
                this.setState({
                    user: {
                        ...this.state.user,
                        password: '',
                        passwordRepeat: ''
                    }
                });

                swal({ title: "Успешно", icon: "success", button: "Ок" });
            })
            .catch(() => {
                swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
            });
        }
    }
    
    render = () => {
        const user = this.state.user;
        const isUserEdit = this.state.isUserEdit;
        
        return (
            <div className="as-row profile form">
                <div>
                    <div className="div-title">Анкета</div>
                    <div className="content">
                        <label>
                            <div className="title">Тип пользователя</div>
                            <div className="value">Пользователь</div>
                        </label>

                        <label>
                            <div className="title required">ФИО</div>
                            <div className="value">
                                { isUserEdit ?
                                    <input className="form-control form-control-sm" type="text" value={user.name} onChange={(e) => this.setData('name', e.target.value)}/>
                                    :
                                    user.name
                                }
                            </div>
                        </label>

                        <label>
                            <div className="title">Агенство</div>
                            <div className="value">
                                { isUserEdit ?
                                    <input className="form-control form-control-sm" type="text" value={user.agency} onChange={(e) => this.setData('agency', e.target.value)}/>
                                    :
                                    user.agency
                                }
                            </div>
                        </label>

                        <label>
                            <div className="title">Специализация</div>
                            <div className="value">
                                { isUserEdit ?
                                    <select className="custom-select custom-select-sm" value={user.specialize} onChange={(e) => this.setData('specialize', e.target.value)}>
                                        {
                                            this.props.general.specialize.map(item =>
                                                <option value={item.id} key={item.id}>{item.name}</option>    
                                            )
                                        }
                                    </select>
                                    :
                                    this.getUserSpecialize(user)
                                }
                            </div>
                        </label>

                        <label>
                            <div className="title">Наличие транспорта</div>
                            <div className="value">
                                { isUserEdit ?
                                    <select className="custom-select custom-select-sm" value={user.hasCar} onChange={(e) => this.setData('hasCar', +e.target.value)}>
                                        <option value="0">Нет</option>
                                        <option value="1">Да</option>
                                    </select>
                                    :
                                    user.hasCar ? 'Да' : 'Нет'
                                }
                            </div>
                        </label>

                        <div className="hr"></div>

                        <label>
                            <div className="title">Телефон</div>
                            <div className="value">
                                { isUserEdit ?
                                    <input className="form-control form-control-sm" type="text" value={user.phone} onChange={(e) => this.setData('phone', e.target.value)}/>
                                    :
                                    user.phone
                                }
                            </div>
                        </label>

                        <label>
                            <div className="title">Email</div>
                            <div className="value">
                                { isUserEdit ?
                                    <input className="form-control form-control-sm" type="text" value={user.email} onChange={(e) => this.setData('email', e.target.value)}/>
                                    :
                                    user.email
                                }
                            </div>
                        </label>

                        <label>
                            <div className="title">Частный риелтор</div>
                            <div className="value">
                                { isUserEdit ?
                                    <input type="checkbox" checked={user.private} onChange={(e) => this.setData('private', e.target.checked)}/>
                                    :
                                    user.private ? 'Да' : 'Нет'
                                }
                            </div>
                        </label>

                        {
                            user.private === 0 ?
                            <label>
                                <div className="title">Телефон руководителя</div>
                                <div className="value">
                                    { isUserEdit ?
                                        <input className="form-control form-control-sm" type="text" value={user.phoneChief} onChange={(e) => this.setData('phoneChief', e.target.value)}/>
                                        :
                                        user.phoneChief
                                    }
                                </div>
                            </label>
                            :
                            null
                        }
                        
                        {
                            !this.state.isUserEdit ?
                            <div className="input-group btn-group">
                                <button className="btn btn-sm btn-info" onClick={() => this.setState({ isUserEdit: true })}>Редактировать</button>
                            </div>
                            :
                            <div className="input-group btn-group">
                                <button className="btn btn-sm btn-info" onClick={this.saveUser}>Сохранить</button>
                                <button onClick={this.resetUserData} className="btn btn-sm btn-danger">Отменить</button>
                            </div>
                        }
                    </div>
                </div>

                <div>
                    <div className="div-title">Данные авторизации</div>

                    <div className="content">
                        <div className="form" onSubmit={this.saveAuthorizationData}>
                            <label>
                                <div className="title">Логин</div>
                                <input className="form-control form-control-sm" type="text" disabled value={user.phone}/>
                            </label>

                            <label>
                                <div className="title">Пароль</div>
                                <input className="form-control form-control-sm" type="password" value={user.password} onChange={(e) => this.setData('password', e.target.value)}/>
                            </label>

                            <label>
                                <div className="title">Повторение пароль</div>
                                <input className="form-control form-control-sm" type="password" value={user.passwordRepeat} onChange={(e) => this.setData('passwordRepeat', e.target.value)}/>
                            </label>
                            
                            <label>
                                <button className="btn btn-sm btn-info" onClick={this.saveAuthorizationData}>Сохранить</button>
                            </label>
                        </div>
                    </div>
                </div>
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
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProfileMainPage)
