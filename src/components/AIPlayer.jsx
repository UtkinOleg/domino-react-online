import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components';
import Tile from './Tile'
import { drawTileToAI, aiMakesMove } from '../redux/dominoSlice'
import { StockContainer, Title, SubTitle as ST } from './styled'

const SubTitle = styled(ST)`
  margin-bottom: 0.5rem;
`
const AIPlayer = () => {
  const dispatch = useDispatch()
  const {
    players: [, aiPlayer], winner,
  } = useSelector((state) => state.domino)
  // untill aiPlayer.missedLastMove is not 0, every 'delay'
  const delay = 600 // ms
  // milliseconds dispatch draw tile
  useEffect(() => {
    if (aiPlayer?.missedLastMove > 0 && !winner) {
      setTimeout(() => {
        dispatch(drawTileToAI())
        dispatch(aiMakesMove())
      }, delay)
    }
  }, [aiPlayer?.missedLastMove, winner])
  return (
    <>
      {aiPlayer?.stock?.length > 0 ? (
        <>
          <Title>{`Игрок: ${aiPlayer?.name}`}</Title>
          <StockContainer>
            {aiPlayer?.stock?.map((tile) => (
              <Tile
                key={tile.id}
                tile={tile}
                size="sm"
                variant="dimmed"
                faceDown
              />
            ))}
          </StockContainer>
        </>
      ) : (
        <>
          <Title>фишки ИИ</Title>
          <SubTitle>- нет фишек</SubTitle>
        </>
      )}
    </>
  )
}

export default AIPlayer
