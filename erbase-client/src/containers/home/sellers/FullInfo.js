import React from 'react'
import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal, Button } from 'react-bootstrap'
import './style.scss'
import ImageGallery from 'react-image-gallery'
import Api from '../../../utils/api'

class SellersFullInfo extends React.Component {
    constructor (props) {
        super(props);
        
        this.state = {
            data: [],
            isImageGalleryShow: false,
            apartmentPhotos: [],
            apartmentLayout: []
        };
    }

    componentWillMount () {
        const data = this.props.data;

        const apartmentPhotos = data.photoArray ?
            data.photoArray.split(',').map(item => {
                return { original: 'http://' + Api.getAPIUrl() + '/static/photo/' + data.id + '_' + item + '.png' }
            })
            : [];

        const apartmentLayout = data.layoutArray ?
            { original: 'http://' + Api.getAPIUrl() + '/static/layout/' + data.id + '_' + data.layoutArray.split(',')[0] + '.png' }
            : [];

        this.setState({
            apartmentPhotos,
            apartmentLayout
        });
    }

    onImageGalleryShow (type, index) {
        const state = this.state;
        let array = [];

        if (type === 'photo') {
            array = state.apartmentPhotos;
        }
        else {
            array = [state.apartmentLayout];
        }

        this.setState({
            isImageGalleryShow: true,
            imageGalleryArray: array
        }, () => {
            this.imageGallery.fullScreen();
            this.imageGallery.slideToIndex(index);
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

    render = () => {
        const data = this.props.data;
        const { apartmentPhotos, apartmentLayout, imageGalleryArray } = this.state;

        return (
            <>
            { data.id > 0 ?
                <Modal size="lg" className="seller-card" show={true} onHide={this.props.onHide}>
                    <Modal.Header closeButton>
                        <Modal.Title>Объект №{data.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div class="object-id">
                            <span class="id">Код {data.id}</span>
                            <span class="address">{data.address}</span>
                        </div>

                        <div className="info">
                            <div className="block">
                                <div className="title">Основные характеристики</div>
                                <div className="two-side">
                                    <ul>
                                        <li>Количество комнат:</li>
                                        <li>Площадь:</li>
                                        <li>Этаж:</li>
                                        <li>Год постройки:</li>
                                        <li>Ремонт:</li>
                                        <li>Стоимость:</li>
                                    </ul>
                                    <ul>
                                        <li>{data.rooms}</li>
                                        <li>{data.square}</li>
                                        <li>{data.floor}</li>
                                        <li>{data.builtYear}</li>
                                        <li>{data.repairs}</li>
                                        <li><span style={{fontWeight: 'bold', fontSize: 20}}>{(data.cost * 1000).toLocaleString('ru')} р.</span> ({(data.priceM2 * 1000).toLocaleString('ru')} р/м2)</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="block">
                                <div className="title">Ответственный специалист</div>
                                <ul>
                                    <li>{data.realtorName}</li>
                                    <li>
                                        <span>Телефон:</span>
                                        <span>{data.realtorPhone}</span>
                                    </li>
                                    <li>
                                        <span>Email:</span>
                                        <span>{data.realtorEmail}</span>
                                    </li>
                                </ul>
                                <div className="realtorLogo" style={{backgroundImage: 'url(http://' + Api.getAPIUrl() + '/static/designLogo/' + data.realtor + '.png)'}}></div>
                            </div>
                        </div>

                        <div className="photo-gallery">
                            {
                                apartmentPhotos.map((item, index) =>
                                    <div key={item} onClick={() => this.onImageGalleryShow('photo', index)} style={{backgroundImage: 'url(' + item.original + ')'}}/>
                                )
                            }
                        </div>

                        <div className="info">
                            <div className="block">
                                <div className="title">Описание</div>
                                <div>{data.info}</div>
                            </div>
                            <div className="block">
                                <div className="title">Планировка</div>
                                {
                                    data.layoutArray &&
                                        <div className="layoutImg" onClick={() => this.onImageGalleryShow('layout', 0)} style={{backgroundImage: 'url(' + apartmentLayout.original + ')'}}/>
                                }
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
                : null
                }
                { this.state.isImageGalleryShow &&
                    <ImageGallery ref={el => this.imageGallery = el} onScreenChange={this.onGalleryScreenChange} showIndex={true} items={imageGalleryArray} />
                }
            </>
        )
    }
}

const mapStateToProps = ({ user, seller, router }) => ({
    user,
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
)(SellersFullInfo)
