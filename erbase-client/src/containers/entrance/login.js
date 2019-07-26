import React from 'react'
import { Link } from 'react-router-dom'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { authenticate } from '../../modules/user'
import Api from '../../utils/api'
import sha256 from 'sha256'
import swal from 'sweetalert'

import '../../style/entrance.scss'

class Login extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            data: {
                login: '+7',
                password: ''
            }
        };
    }

    proceed = (event) => {
        event.preventDefault();

        let data = this.state.data;

        Api.authenticate({ phone: data.login, password: sha256(data.password) })
        .then(out => {
            if(out.isAuth()) {
                this.props.authenticate();
                this.props.getUserInfo();
            }
        })
        .catch(out => {
            swal({ title: "Произошла ошибка", text: "Проверьте данные входа", icon: "error", button: "Ок" });
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
            <div className="form">
                <form onSubmit={this.proceed}>
                    <div className="title">Вход</div>

                    <label>
                        <input type="text" value={data.login} onChange={(e) => this.setData('login', e.target.value)} placeholder="Номер телефона" className="form-control form-control-sm"/>
                    </label>

                    <label>
                        <input type="password" value={data.password} onChange={(e) => this.setData('password', e.target.value)} placeholder="Пароль" className="form-control form-control-sm"/>
                        <Link className="forgot" to="/forgot">Забыли пароль?</Link>
                    </label>

                    <div className="center">
                        <input type="submit" value="Войти" className="btn btn-info"/>
                        <Link to='/signup' className="signupLink">Регистрация</Link>
                    </div>
                </form>

                <div className="info-text">Взаимодействуйте с другими агенствами, находите покупателей и продавцов по всему городу, мониторьте рынок и доски объявлений автоматически, совершайте быстрые совместные сделки, оказывайте качественные услуги вашим клиентам.</div>
            </div>
        )
    }
}

const mapStateToProps = ({ user }) => ({
    user
})

const mapDispatchToProps = dispatch =>
bindActionCreators(
{
    authenticate,
    changePage: (page) => push(page)
},
    dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Login)
