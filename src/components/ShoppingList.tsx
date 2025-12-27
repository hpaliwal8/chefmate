import React, { useState, ChangeEvent } from 'react';
import { ShoppingCart, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ShoppingListItem } from '../types';
import '../styles/ShoppingList.css';

type SortBy = 'name' | 'aisle';

const ShoppingList: React.FC = () => {
  const {
    shoppingList,
    removeFromShoppingList,
    toggleShoppingListItem,
    clearShoppingList,
  } = useAppContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('name');

  if (shoppingList.length === 0) {
    return null;
  }

  const sortedList = [...shoppingList].sort((a, b) => {
    if (sortBy === 'aisle') {
      return (a.aisle || 'Unknown').localeCompare(b.aisle || 'Unknown');
    }
    return a.name.localeCompare(b.name);
  });

  // Group by aisle if sorting by aisle
  const groupedByAisle: Record<string, ShoppingListItem[]> | null =
    sortBy === 'aisle'
      ? sortedList.reduce((acc, item) => {
          const aisle = item.aisle || 'Other';
          if (!acc[aisle]) acc[aisle] = [];
          acc[aisle].push(item);
          return acc;
        }, {} as Record<string, ShoppingListItem[]>)
      : null;

  const uncheckedCount = shoppingList.filter((item) => !item.checked).length;

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortBy);
  };

  return (
    <div className={`shopping-list-container ${isExpanded ? 'expanded' : ''}`}>
      <div className="shopping-list-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-content">
          <h3>
            <ShoppingCart size={18} /> Shopping List
            {uncheckedCount > 0 && <span className="item-count">{uncheckedCount}</span>}
          </h3>
          <button className="toggle-button">{isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</button>
        </div>
      </div>

      {isExpanded && (
        <div className="shopping-list-content">
          <div className="list-controls">
            <div className="sort-controls">
              <label>Sort by:</label>
              <select value={sortBy} onChange={handleSortChange} className="sort-select">
                <option value="name">Name</option>
                <option value="aisle">Aisle</option>
              </select>
            </div>
            <button onClick={clearShoppingList} className="clear-button">
              Clear All
            </button>
          </div>

          <div className="items-container">
            {sortBy === 'aisle' && groupedByAisle ? (
              // Grouped by aisle view
              Object.entries(groupedByAisle).map(([aisle, items]) => (
                <div key={aisle} className="aisle-group">
                  <h4 className="aisle-header">{aisle}</h4>
                  <ul className="items-list">
                    {items.map((item, idx) => (
                      <li
                        key={`${item.name}-${idx}`}
                        className={`shopping-item ${item.checked ? 'checked' : ''}`}
                      >
                        <label className="item-label">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleShoppingListItem(item.name)}
                          />
                          <span className="item-text">
                            {item.name}
                            {item.amount && item.unit && (
                              <span className="item-amount">
                                {' '}
                                ({item.amount} {item.unit})
                              </span>
                            )}
                          </span>
                        </label>
                        <button
                          onClick={() => removeFromShoppingList(item.name)}
                          className="remove-button"
                          title="Remove item"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              // Simple list view
              <ul className="items-list">
                {sortedList.map((item, idx) => (
                  <li
                    key={`${item.name}-${idx}`}
                    className={`shopping-item ${item.checked ? 'checked' : ''}`}
                  >
                    <label className="item-label">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleShoppingListItem(item.name)}
                      />
                      <span className="item-text">
                        {item.name}
                        {item.amount && item.unit && (
                          <span className="item-amount">
                            {' '}
                            ({item.amount} {item.unit})
                          </span>
                        )}
                      </span>
                    </label>
                    <button
                      onClick={() => removeFromShoppingList(item.name)}
                      className="remove-button"
                      title="Remove item"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="list-summary">
            <p>
              {uncheckedCount} of {shoppingList.length} items remaining
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
