import { useState } from 'react';
import { Plus } from 'lucide-react';
import { themes } from '@styles/themes';
import { useTheme } from '@contexts/ThemeContext';
import ProductList from '../ProductList';
import ItemCardEditable from '../../../comparison-aspect-page/ComparisonItemCard/ItemCardEditable';

const ProductsTab = ({ userId, isPublic }) => {
  const { themeId } = useTheme();
  const t = themes[themeId] ?? themes.light;
  const [products, setProducts] = useState([]);
  const [addOpen, setAddOpen] = useState(false);

  const handleUpdate = updated =>
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));

  const handleDelete = id =>
    setProducts(prev => prev.filter(p => p.id !== id));

  return (
    <div className="pt-4">
      {!isPublic && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setAddOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: '"Fraunces", serif',
              fontSize: 14,
              background: t.ink,
              color: t.bg,
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            add item
          </button>
        </div>
      )}

      <ProductList
        products={products}
        setProducts={setProducts}
        userId={userId}
        isPublic={isPublic}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {addOpen && (
        <ItemCardEditable
          item={{}}
          onSave={item => {
            setProducts(prev => [item, ...prev]);
            setAddOpen(false);
          }}
          onCancel={() => setAddOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductsTab;
