import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TweetBox from "../TweetBox";
import CircularProgress from "@mui/material/CircularProgress";

function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                className={"dark:bg-dark dark:text-white"}
                {...other}
            >
                    {value === index && (
                        <Box sx={{ p: 3 }}>
                                <Typography>{children}</Typography>
                        </Box>
                    )}
            </div>
        );
}

TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
};

function a11yProps(index) {
        return {
                id: `simple-tab-${index}`,
                'aria-controls': `simple-tabpanel-${index}`,
        };
}

export default function TwitterTabs(props) {
        const [value, setValue] = React.useState(0);
        const handleChange = (event, newValue) => {
                setValue(newValue);
        };
        return (
            <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs textColor="primary" sx={{
                                    "& .MuiTab-textColorPrimary": {
                                            color: "#1976d2", // Ou une autre couleur de votre choix
                                    },
                            }}
                                  centered
                                  indicatorColor="primary" value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab  textColor="primary"  label="Tweets" {...a11yProps(0)} />
                                    <Tab  textColor="primary" label="Retweets" {...a11yProps(1)} />
                                    <Tab  textColor="primary"  label="Media" {...a11yProps(2)} />
                                    <Tab  textColor="primary"  label="Likes" {...a11yProps(3)} />
                            </Tabs>
                    </Box>
                    <TabPanel value={value} index={0}>
                            <>{!props.isLoading ?
                                props?.tweets?.map((tweet, index) => {
                                        return <TweetBox key={'twitter_id_'+ tweet.id + 'index_id' + index} user={props.user} tweet={tweet} />
                                })
                                : <div className={'w-full whitespace-nowrap'}>
                                        <div className={'flex w-full justify-center mt-5 gap-5 relative'}>
                                                <CircularProgress/>
                                        </div>
                                        <p className={'relative w-full text-center mt-2 font-extrabold text-xl'}>Loading {props.username} tweet(s) !</p>
                                </div>}</>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                            <>{!props.retweetsLoading && props.retweets ?
                                props?.retweets.retweet?.map((tweet, index) => {
                                        return <TweetBox isRetweet={true} key={'twitter_id_'+ tweet.id + 'index_id' + index} user={props.user} tweet={tweet} />
                                })
                                : <div className={'w-full whitespace-nowrap'}>
                                        <div className={'flex w-full justify-center mt-5 gap-5 relative'}>
                                                <CircularProgress/>
                                        </div>
                                        <p className={'relative w-full text-center mt-2 font-extrabold text-xl'}>Loading {props.username} tweet(s) !</p>
                                </div>}</>
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                            <Typography>Your Media</Typography>
                    </TabPanel>
                    <TabPanel value={value} index={3}>
                            <Typography>Tweets who you give a likes</Typography>
                    </TabPanel>
            </Box>
        );
}