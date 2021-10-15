import React from 'react';
import './dashboard.css';

import GridViewIcon from '@mui/icons-material/GridView';

import  graph_yellow from '../../../images/graph_yellow.png';
import  graph_grape from '../../../images/graph_grape.png';
import  graph_big from '../../../images/graph_big.png';
import  back_yellow from '../../../images/back_yellow.png';
import  back_pink from '../../../images/back_pink.png';
import  back_blue from '../../../images/back_blue.png';
import  back_gradient from '../../../images/back_gradient.png';
import  shoes from '../../../images/shoes.png';
import  dollar from '../../../images/dollar.png';

function Dashboard() {
    return (
        <div className="i_center">
            <div className="ic_top">
                <div className="t_up">
                    <div className="tu_left">
                        <div className="tul_text">  
                        </div>
                        <div className="tul_text">
                            <div className="tul_up">
                                Overview
                            </div>
                            <div className="tul_down">
                                Data overview of your Cryptocurenncy account.
                            </div>
                        </div>
                    </div>
                    <div className="tu_right">
                        <button className="tur_b1"><GridViewIcon sx={{ fontSize: 15 }} color="primary"/></button>
                        <button className="tur_b2">{`<`}</button>
                        <button className="tur_b3">{'>'}</button>
                    </div>
                </div>
                <div className="t_center">
                    <div className="tc_left">
                        <div className="tcl_up">
                            <div className="tclu_l">
                                <img src={shoes} width="50px" height="50px"></img>
                                <span className="tclu_text1">sNFT Price Chart</span>
                            </div>
                            <div className="tclu_r">
                                <div className="tclur_text1">
                                    $721,345
                                </div>
                                <div className="tclur_text2">
                                    -4.68%   
                                </div>
                            </div>
                        </div>
                        <div className="tcl_down">
                             <img src={graph_yellow} width="95%" height="80%"></img>
                        </div>
                    </div>
                    <div className="tc_right">
                        <div className="tcr_up">
                            <div className="tcru_l">
                                <img src={dollar} width="25px" height="45px"></img>
                                <span className="tcru_text1">$Shoe Token Price Chart</span>
                            </div>
                            <div className="tcru_r">
                                <div className="tcrur_text1">
                                    $0.71
                                </div>
                                <div className="tcrur_text2">
                                    0.48%   
                                </div>
                            </div>
                        </div>
                        <div className="tcr_down">
                            <img src={graph_grape} width="95%" height="80%"></img>
                        </div>
                    </div>
                </div>
                <div className="t_down">
                    <div className="td_u">
                        sNFT Staking
                    </div>
                    <div className="td_d">
                        <div className="td_rect1">
                            {/* <img src={back_yellow} width="100%" height="100%">
                            </img> */}
                            STAKE sNFTs
                        </div>
                        <div className="td_rect2">
                            HARVEST REWARDS
                            {/* <img src={back_pink} width="100%" height="100%"></img> */}
                        </div>
                        <div className="td_rect3">
                            UNSTAKE sNFT
                            {/* <img src={back_blue} width="100%" height="100%"></img> */}
                        </div>
                        <div className="td_rect4">
                            + APPLY bNFT BOOSTER
                            {/* <img src={back_gradient} width="100%" height="100%"></img> */}
                        </div>
                    </div>
                    
                </div>
            </div>
            <div className="ic_bottom">
                <div className="icb_up">
                    <div className="icb1">
                        <div className="icb1_l">
                            sNFT STAKING APY
                        </div>
                        <div className="icb1_r">
                            <span className="icb1_text">Year</span>
                            <span className="icb1_text">Month</span>
                            <span className="icb1_text">Week</span>
                            <span className="icb1_text">Day</span>
                        </div>
                    </div>
                    <div className="icb2">
                        <div className="icb2_l">
                            200%
                        </div>
                        <div className="icb2_r"></div>
                    </div>
                    <div className="icb3">
                        <div className="icb3_l">
                                150%
                        </div>
                        <div className="icb3_r"></div>
                    </div>
                    <div className="icb4">
                        <div className="icb4_l">
                                100%
                        </div>
                        <div className="icb4_r"></div>
                    </div>
                    
                    <div className="icb5">
                        <div className="icb5_l">
                            50%
                        </div>
                        <div className="icb5_r"></div>
                    </div>
                    <div className="icb6">
                        <div className="icb6_l">
                                0%
                            </div>
                        <div className="icb6_r"></div>
                    </div>
                    <div className="icb7">
                        <span className="icb7_text">01:00AM</span>
                        <span className="icb7_text">02:00AM</span>
                        <span className="icb7_text">03:00AM</span>
                        <span className="icb7_text">04:00AM</span>
                        <span className="icb7_text">05:00AM</span>
                        <span className="icb7_text">06:00AM</span>
                        <span className="icb7_text">07:00AM</span>
                        <span className="icb7_text">08:00AM</span>
                        <span className="icb7_text">09:00AM</span>
                        <span className="icb7_text">10:00AM</span>
                    </div>
                </div>
                <div className="icb_down"></div>
            </div>
        </div>
    );
}

export default Dashboard;