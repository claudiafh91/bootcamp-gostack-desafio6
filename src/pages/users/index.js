/* eslint-disable react/state-in-constructor */
/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../service/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Title,
  Author,
  Info,
  DetailsButton,
  DetailsText,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    isRefreshing: false,
    loadPage: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ loading: true });

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({
      stars: response.data,
      loading: false,
    });
  }

  loadMore = async () => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const { page, stars } = this.state;

    this.setState({ loadPage: true });

    const number = page + 1;

    const newStars = await api.get(`/users/${user.login}/starred`, {
      params: {
        page: number,
      },
    });

    this.setState({
      stars: [...stars, ...newStars.data],
      page: number,
      loadPage: false,
    });
  };

  refreshList = async () => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ isRefreshing: true });

    const newStars = await api.get(`/users/${user.login}/starred`, {
      params: {
        page: 1,
      },
    });

    this.setState({
      stars: newStars.data,
      page: 1,
      isRefreshing: false,
    });
  };

  handleFooterStars = () => {
    const { loadPage } = this.state;

    if (loadPage) {
      return <ActivityIndicator size={30} color="#333" />;
    }
    return null;
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, isRefreshing } = this.state;

    const user = navigation.getParam('user');
    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading ? (
          <ActivityIndicator size={30} color="#333" />
        ) : (
          <Stars
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            ListFooterComponent={this.handleFooterStars}
            onRefresh={this.refreshList}
            refreshing={isRefreshing}
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                  <DetailsButton onPress={() => this.handleNavigate(item)}>
                    <DetailsText>Details</DetailsText>
                  </DetailsButton>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
