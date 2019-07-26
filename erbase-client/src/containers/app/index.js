import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Home from '../home'
import { Login, Signup, SignupConfirm, Forgot } from '../entrance'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { logout, authenticate, setUserInfo } from '../../modules/user'
import Api from '../../utils/api'
import swal from 'sweetalert'

class App extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            errorWindowData: null
        };

        Api.on('error', (data) => {
            this.setState({ errorWindowData: data });
        });
    }

    componentWillMount = () => {
        this.getUserInfo();

        if(window.location.hostname.indexOf('www') !== -1) {
            window.location.href = window.location.href.replace('www.', '');
        }
    }

    getUserInfo = () => {
        Api.user()
        .then(out => {
            if(!out.isAuth()) {
                this.logout();
                this.props.changePage('/');
            }
            else {
                this.props.authenticate();
                this.props.setUserInfo(out);
            }
        })
        .catch(out => {
            this.props.changePage('/');
        });
    }

    logout = () => {
        Api.get('/user/logout')
        .then(out => {
            this.props.logout();
            this.props.changePage('/');
        })
        .catch(out => {
            swal({ title: "Произошла ошибка", icon: "error", button: "Ок" });
        });
    }

    render = () => {
        const location = this.props.location;
        
        return (
            <>
                {
                    this.props.user.isLoggedIn ? 
                        <Home getUserInfo={this.getUserInfo} logout={this.logout}/>
                        :
                        <div className="entrance">
                            <div className="logo">
                                <img src="/image/entranceLogo.png" draggable="false" alt="" />
                                <div>
                                    <h1>erBase</h1>
                                    <div>Единая база недвижимости для агенств и частных риелторов</div>
                                    <div>г. Ханты-Мансийск</div>
                                </div>
                            </div>

                            <img src="/image/entranceRight.png" className="entranceRight" alt="" />
                            
                            <Switch location={location}>
                                <Route exact path="/" component={() => <Login getUserInfo={this.getUserInfo} />}/>
                                <Route path="/signup" component={() => <Signup getUserInfo={this.getUserInfo} />}/>
                                <Route path="/forgot" component={() => <Forgot />} />
                                <Route path="/c" component={() => <SignupConfirm getUserInfo={this.getUserInfo}/>}/>
                            </Switch>
                        </div>
                }
                { this.state.errorWindowData &&
                    <div id="errorWindow">
                        <div className="close" onClick={() => this.setState({ errorWindowData: null })}></div>
                        <div className="body">
                            <div className="title">Код ошибки:</div>
                            <textarea onClick={(e) => e.target.select()} value={this.state.errorWindowData} readonly="readonly"></textarea>
                        </div>
                    </div>
                }
            </>
        )
    }
}

const mapStateToProps = ({ user, seller, buyer, deal, router }) => ({
    user,
    seller,
    buyer,
    deal,
    location: router.location
})

const mapDispatchToProps = dispatch =>
bindActionCreators(
{
    logout,
    authenticate,
    setUserInfo,
    changePage: (page) => push(page)
},
dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)
