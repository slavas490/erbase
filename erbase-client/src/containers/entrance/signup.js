import React from 'react'
import { Link } from 'react-router-dom'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Api from '../../utils/api'
import sha256 from 'sha256'
import swal from 'sweetalert'
import {
	authenticate
} from '../../modules/user'

import '../../style/entrance.scss'

class Signup extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			data: {
				name: '',
				phoneNumber: '+7',
				email: '',
				agency: '',
				specialize: 1,
				password: '',
				passwordConfirm: '',
				phoneNumberChief: '',
				privateRealtor: false
			},
			error: null
		};
	}

	proceed = (event) => {
		const errorMsg = (msg) => {
			swal({ text: msg, icon: 'error', button: 'Ок' });
		};

		event.preventDefault();
		let data = Object.assign({}, this.state.data);

		if(!data.name || !data.phoneNumber || !data.email || !data.agency || !data.specialize || !data.password || !data.passwordConfirm) {
			errorMsg('Все поля необходимы для заполнения!');
		}
		else if(data.password !== data.passwordConfirm) {
			errorMsg('Подтверждение пароля не совпадает');
		}
		else if(data.password.length < 6 || data.password.length > 16) {
			errorMsg('Пароль должен быть длинной от 6 до 16 символов');
		}
		else if(!/^[a-zA-Z_.0-9]+@[a-zA-Z_]+?\.[a-zA-Z]{2,10}$/.test(data.email)) {
			errorMsg('Email указан в неверном формате');
		}
		else if(!/^\+7[0-9]{10}$/.test(data.phoneNumber)) {
			errorMsg('Номер телефона необходимо указывать начиная с +7 и 10 цифр');
		}
		else {
			let user = { 
				name: data.name,
				password: sha256(data.password),
				phone: data.phoneNumber,
				email: data.email,
				agency: data.agency,
				specialize: data.specialize,
				phoneChief: data.phoneNumberChief,
				private: data.privateRealtor,
			};

			Api.post('/user', user)
			.then(out => {
				if(out.isAuth()) {
					swal({ text: "Для завершения регистрации перейдите по ссылке указанной в письме на электронной почте", icon: "info", button: "Ок" });
					this.props.changePage('/');
				}
				else {
					errorMsg('Произошла ошибка');
				}
			})
			.catch(error => {
				if(error === 100) {
					errorMsg('Указанный телефон уже существует!');
				}
				else {
					errorMsg('Произошла ошибка');
				}
			});
		}
	}

	setData = (name, value) => {
        let state = Object.assign({}, this.state);
        
        state.data[name] = value;
        this.setState(state);
    }

	render = () => {
		let data = this.state.data;
		
		return (
			<div className="form signup">
				<form onSubmit={this.proceed}>
					<div className="title">Регистрация</div>

					<div className="as-row">
						<label>
							<div className="title">Телефон</div>
							<input type="text" value={data.phoneNumber} onChange={(e) => this.setData('phoneNumber', e.target.value)}/>
						</label>

						<label>
							<div className="title">ФИО</div>
							<input type="text" value={data.name} onChange={(e) => this.setData('name', e.target.value)}/>
						</label>

						<label>
							<div className="title">Агенство</div>
							<input type="text" value={data.agency} onChange={(e) => this.setData('agency', e.target.value)}/>
						</label>
					</div>

					<div className="as-row">
						<label>
							<div className="title">Пароль</div>
							<input type="password" value={data.password} onChange={(e) => this.setData('password', e.target.value)}/>
						</label>

						<label>
							<div className="title">Email</div>
							<input type="text" value={data.email} onChange={(e) => this.setData('email', e.target.value)}/>
						</label>

						<label className="check">
							<input type="checkbox" checked={data.privateRealtor} onChange={(e) => this.setData('privateRealtor', e.target.checked)}/> <span className="title">Частный риелтор</span>
						</label>
					</div>

					<div className="as-row">
						<label>
							<div className="title">Подтверждение пароля</div>
							<input type="password" value={data.passwordConfirm} onChange={(e) => this.setData('passwordConfirm', e.target.value)}/>
						</label>

						<label className="select">
							<div className="title">Специализация</div>
							<select style={{width: '100%'}} value={data.specialize} onChange={(e) => this.setData('specialize', e.target.value)}>
								{
									this.props.general.specialize.map(item =>
										<option value={item.id} key={item.id}>{item.name}</option>
									)
								}
							</select>
						</label>

						{ !data.privateRealtor &&
							<label>
								<div className="title">Телефон руководителя</div>
								<input type="text" value={data.phoneNumberChief} onChange={(e) => this.setData('phoneNumberChief', e.target.value)}/>
							</label>
						}
					</div>
				
					<div>
						<Link to='/' className="signupLink">Вход</Link>
						<input type="submit" className="btn btn-info btn-sm" value="Зарегистрироваться" />
					</div>
				</form>
			
				<div className="info-text">Взаимодействуйте с другими агенствами, находите покупателей и продавцов по всему городу, мониторьте рынок и доски объявлений автоматически, совершайте быстрые совместные сделки, оказывайте качественные услуги вашим клиентам.</div>
			</div>
		)
	}
}

const mapStateToProps = ({ user, general }) => ({
	user,
	general
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
)(Signup)
