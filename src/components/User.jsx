import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import Tile from './Tile'
import {
  drawTileToUser,
  drawTileToAI,
  userMissesMove,
  aiMakesMove,
  restartGame,
} from '../redux/dominoSlice'
import {
  StockContainer,
  Title,
  SubTitle,
  Button,
} from './styled'
import { clearState } from '../util/localStorage'

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

const User = () => {
  const {
    players: [user],
    stock,
    winner,
  } = useSelector((state) => state.domino)
  const dispatch = useDispatch()
  const handleDrawTile = () => {
    dispatch(drawTileToUser())
  }
  const handleMissMove = () => {
    dispatch(userMissesMove())
    dispatch(aiMakesMove())
    setTimeout(() => {
      dispatch(drawTileToAI())
    }, 300)
  }
  const handleRestart = () => {
    clearState()
    dispatch(restartGame())
  }
  return (
    <>
      <Title>{`Игрок: ${user?.name}`}</Title>
      {!user?.stock?.length && (
        <SubTitle>Набор фишек пуст</SubTitle>
      )}
      {!winner && (
      <Message>
        Перенесите фишку на игровое поле
      </Message>
      )}
      <StockContainer>
        {user?.stock?.map((tile) => (
          <Tile key={tile.id} tile={tile} draggable={!winner} />
        ))}
      </StockContainer>
      {winner && (winner?.id === 1 ? (
        <WinMessage>
          Вы выиграли!
        </WinMessage>
      ) : (
        <LoseMessage>
          Вы проиграли
        </LoseMessage>
      ))}
      <Button
        onClick={winner ? handleRestart : stock?.length > 0 ? handleDrawTile : handleMissMove}
      >
        {winner ? 'Рестарт' : stock?.length > 0 ? 'Новая фишка' : 'Пропустить'}
      </Button>
    </>
  )
}

export default User
