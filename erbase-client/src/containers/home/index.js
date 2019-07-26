import React from 'react'
import { push } from 'connected-react-router'
import { Route, Link, Switch } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { authenticate } from '../../modules/user'
import Api from '../../utils/api'

import '../../style/home.scss'

import Ads from './ads'
import Deals from './deals'
import Sellers from './sellers'
import Buyers from './buyers'
import Realtors from './realtors'
import Profile from './profile'

class Home extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            activeTab: 0,
            color: ['rgba(16, 224, 16, 0.2)', 'rgba(249, 249, 77, 0.3)', 'rgba(245, 113, 113, 0.2)']
        };
    }

    isActiveTab = (path = '') => {
        const location = this.props.location;
        let pathname = location.pathname.split('/');
        let prefix = 'btn btn-sm ';
        let isActive = false;

        if(!(path instanceof Array)) {
            path = [path];
        }

        for(let i=0; i<path.length; i++) {
            isActive = (pathname[0] + pathname[1]).length === path[i].length && pathname.indexOf(path[i]) > -1;

            if(isActive) {
                break;
            }
        }

        if(isActive) {
            return prefix + 'active btn-info';
        }
        else {
            return prefix + 'btn-light';
        }
    };

    getBreadcrumbs = () => {
        const path = this.props.location.pathname;
        const locationArray = path.split('/');
        const baseLocation = locationArray[1];
        let array = [];

        if(baseLocation === '') {
            array.push({ link: path, name: 'Объявления' });
            array.push({ link: path, name: 'В работе' });
        }
        else if(baseLocation === 'all') {
            array.push({ link: '', name: 'Объявления' });
            array.push({ link: path, name: 'Новые' });
        }
        else if(baseLocation === 'sellers') {
            array.push({ link: baseLocation, name: 'Объекты' });

            if(locationArray[2] === 'all') {
                array.push({ link: path, name: 'Новые' });
            }
            else if(locationArray[2] === 'create') {
                array.push({ link: path, name: 'Новый' });
            }
            else if(locationArray[2] === 'edit' && this.props.seller.data.id) {
                array.push({ link: path, name: 'Редактирование' });
            }
            else {
                array.push({ link: path, name: 'В работе' });
            }
        }
        else if(baseLocation === 'buyers') {
            array.push({ link: baseLocation, name: 'Покупатели' });

            if(locationArray[2] === 'all') {
                array.push({ link: path, name: 'Новые' });
            }
            else if(locationArray[2] === 'create') {
                array.push({ link: path, name: 'Новый' });
            }
            else if(locationArray[2] === 'edit' && this.props.buyer.data.id) {
                array.push({ link: path, name: 'Редактирование' });
            }
            else {
                array.push({ link: path, name: 'В работе' });
            }
        }
        else if(baseLocation === 'deals') {
            array.push({ link: baseLocation, name: 'Сделки' });

            if(locationArray[2] === 'create') {
                array.push({ link: path, name: 'Новая' });
            }
            else if(locationArray[2] === 'edit' && this.props.deal.data.id) {
                array.push({ link: path, name: 'Редактирование' });
            }
            else {
                array.push({ link: path, name: 'Все' });
            }
        }
        else if(baseLocation === 'realtors') {
            array.push({ link: baseLocation, name: 'Контакты риелторов' });

            if(locationArray[2] === 'edit') {
                array.push({ link: path, name: 'Редактирование' });
            }
            else {
                array.push({ link: path, name: 'Все' });
            }
        }
        else if(baseLocation === 'profile') {
            array.push({ link: baseLocation, name: 'Личный кабинет' });
        }


        return array;
    }

    render = () => {
        const location = this.props.location;
        const rowHighlight = this.state.color;
        const breadcrumbs = this.getBreadcrumbs();
        const user = this.props.user;
        
        return (
            <>
                { user.designColor && user.designColor.length === 6 && <style dangerouslySetInnerHTML={{__html: `:root { --primary-color: #${user.designColor}; }`}}/>}
                <div className="header">
                    <div className="logo">
                        <img src={ user.customLogo ? '//' + Api.getAPIUrl() + '/static/designLogo/' + user.id + '.png' : '/image/logo.png' } alt="" />
                        { !user.customLogo &&
                            <div className="title">
                                { user.agencyTitle && user.agencyTitle.length > 0 ?
                                    <div style={{fontSize: '28px'}}>{user.agencyTitle}</div>
                                 :
                                    <>
                                        <span className="big">erBase</span>
                                        <span className="small">Единая риэлторская база покупателей и собственников</span>
                                    </>
                                }
                            </div>
                        }
                    </div>

                    <div className="profile">
                        <div className="over">
                            <div className="img noava"></div>
                            <div className="user-name">{user.name}</div>
                        </div>
                        
                        <ul className="menu">
                            <li><Link to="/profile">Личный кабинет</Link></li>
                            <li><Link to="#" onClick={this.props.logout}>Выход</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="breadcrumbs">
                    { breadcrumbs.length > 0 &&
                        breadcrumbs.map((item, i) => 
                            <div>
                                <Link to={(item.link[0] !== '/' ? '/' : '') + item.link} key={item.link}>{item.name}</Link>
                                { i < breadcrumbs.length - 1 && <span className="div">&#8250;</span> }
                            </div>
                        )
                    }
                </div>

                { !user.isActive && <div style={{margin: '10px 0'}} class="alert alert-danger">Ваша учетная запись еще не активирована</div> }

                <div className="content">
                    <div className="home">
                        { user.isActive || user.isAdmin ?
                            <div className="btn-group menu" role="group">
                                <Link className={this.isActiveTab(['', 'all'])} to="/">Объявления</Link>
                                <Link className={this.isActiveTab('sellers')} to="/sellers">Объекты</Link>
                                <Link className={this.isActiveTab('buyers')} to="/buyers">Покупатели</Link>
                                <Link className={this.isActiveTab('deals')} to="/deals">Сделки</Link>
                                <Link className={this.isActiveTab('realtors')} to="/realtors">Контакты риелторов</Link>
                            </div>
                        :
                            null
                        }

                        <div className="container">
                            { user.isActive || user.isAdmin ? 
                                <Switch location={location}>
                                    <Route exact path="/" component={() => <Ads rowHighlight={rowHighlight} />} />
                                    <Route path="/all" component={() => <Ads rowHighlight={rowHighlight} />} />
                                    <Route path="/sellers" component={() => <Sellers rowHighlight={rowHighlight} />} />
                                    <Route path="/deals" component={() => <Deals rowHighlight={rowHighlight} />}  />
                                    <Route path="/buyers" component={() => <Buyers rowHighlight={rowHighlight} />} />
                                    <Route path="/realtors" component={() => <Realtors rowHighlight={rowHighlight} />} />
                                    <Route path="/profile" component={() => <Profile getUserInfo={this.props.getUserInfo} />} />
                                </Switch>
                            :
                                <Switch location={location}>
                                    <Route path="/" component={() => <Profile getUserInfo={this.props.getUserInfo} />} />
                                </Switch>
                            }
                        </div>
                    </div>
                </div>

                <div className="content">erBase.ru - Единая риэлторская база покупателей и собственников</div>
            </>
        );
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
    authenticate,
    changePage: (page) => push(page)
},
dispatch
)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Home)
