import { useSelector } from 'react-redux'
import styled from 'styled-components'
import TileOnline from './TileOnline'
import { StockContainer as SC, Title } from './styled'

const StockContainer = styled(SC)`
  margin-left: -0.5rem;
`

const PlayLineOnline = () => {
  const { playline } = useSelector((state) => state.domino_online)

  return (
    <>
      <Title>Игровое поле</Title>
      <StockContainer>
        {playline?.map((tile, i, a) => (
          <TileOnline
            tile={tile}
            key={tile.id}
            tileStyle="mixed"
            first={i === 0}
            last={i === a.length - 1}
          />
        ))}
      </StockContainer>
    </>
  )
}

export default PlayLineOnline
