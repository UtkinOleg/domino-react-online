import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import TileOnline from './TileOnline'
import {
  drawTileToUser,
  userMissesMove,
  restartGame,
  addPlayer,
} from '../redux/dominoSliceOnline'
import {
  StockContainer,
  Title,
  SubTitle,
  Button,
} from './styled'
import { clearStateOnline } from '../util/localStorage'
import { socket } from '../util/socket';
import { useAuth } from './AuthContext'

const Message = styled(SubTitle)`
  font-weight: 200;
  font-size: 0.9rem;
  color: #555;
`
const WinMessage = styled(Message)`
  font-size: 1.3rem;
`
const LoseMessage = styled(WinMessage)`
  color: red;
`

const UserOnline = () => {
  const auth = useAuth()

  const {
    players: [user, opponentPlayer],
    stock,
    winner,
    move,
  } = useSelector((state) => state.domino_online)
  const dispatch = useDispatch()

  const handleDrawTile = () => {
    dispatch(drawTileToUser())
  }

  const handleMissMove = () => {
    dispatch(userMissesMove())
  }
  
  const handleRestart = () => {
    clearStateOnline()
    dispatch(restartGame())
  }

  useEffect(() => {
    if (auth.userId) {
      dispatch(addPlayer({ id: auth.userId, name: auth.userName }))
      // Send - Im online 
      socket.connect()
      socket.timeout(5000).emit('events', 
        JSON.stringify({ online: true, user: { id: auth.userId, name: auth.userName } }), () => {
      })
    }
    return () => {
      socket.disconnect();
    };
  }, [auth]) 
  
  return (
    <>
      <Title>{`Игрок: ${user?.name}`}</Title>
      {!user?.stock?.length && (
        <SubTitle>Набор фишек пуст</SubTitle>
      )}
      {!winner && user?.id === move && (
      <Message>
        Перенесите фишку на игровое поле
      </Message>
      )}
      {user?.id !== move && opponentPlayer && (
      <Message>
        Ожидание хода противника
      </Message>
      )}
      <StockContainer>
        {user?.stock?.map((tile) => (
          <TileOnline key={tile.id} tile={tile} draggable={!winner && user?.id === move} />
        ))}
      </StockContainer>
      {winner && (winner?.id === user?.id ? (
        <WinMessage>
          Вы выиграли!
        </WinMessage>
      ) : (
        <LoseMessage>
          Вы проиграли!
        </LoseMessage>
      ))}
      {opponentPlayer?.name && user?.id === move && !winner ? (
        <Button
          onClick={stock?.length > 0 ? handleDrawTile : handleMissMove}
        >
          {stock?.length > 0 ? 'Новая фишка' : 'Пропустить'}
        </Button>
      ) : (
        <>
        </>
      )}
    </>
  )
}

export default UserOnline
