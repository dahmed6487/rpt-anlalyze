import React from 'react';
import { withRouter } from 'react-router';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import lookerService from '../../services/looker-service';
import * as UserActions from '../../redux/actions/user-actions';
import axios from 'axios';
import { HelpIcon, BWHelpIcon  } from '../../components/icons/svg';
import { VideoPlayer, VideoPlayerFilled } from "../icons/svg";


class SolutionsPanel extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            solutions: [],
            filteredSolutions: [],
            types: [{ name: 'All', color: '#FFFFFF' }],
            viewByType: 'All',
            sortByProperty: 'Name',
            searchTerm: '',
            loading: true,
            selectedCustomer: '',
            isError: false
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const selectedCustomer = localStorage.getItem('userAccount');
        if (this.props.userType) {
            if (selectedCustomer) {
                if (this.props.solutionsData === '') {
                    lookerService.getSolutionData().then((response) => {
                        this.props.dispatch(UserActions.solutionData(response));
                    }).catch((err) => {
                        this.setState({isError: true});
                    });
                } else {
                    if (selectedCustomer && selectedCustomer !== prevState.selectedCustomer) {
                        this.setState({selectedCustomer: selectedCustomer});
                        this.setState({solutions: this.getDashboardsState()}, () => this.filterSolutions());
                    }
                }
            }
        } else {
            if (selectedCustomer && selectedCustomer !== prevState.selectedCustomer) {
                this.setState({selectedCustomer: selectedCustomer});

                this.getDashboardsState().then(solutions => {
                    this.setState({solutions: solutions}, () => this.filterSolutions());
                });
            }
        }
    }

    render() {
        let solutionsRows = this.generateSolutionRows();
        let typeRows = this.generateTypeRows();
        let sortRows = this.generateSortRows();

        this.handleOutsidePanelClick();

        if (document.getElementById('solutionsSearch')) {
            let solutionsSearchClearButton = document.getElementById(('solutionsSearchClearButton'));
            if (document.getElementById('solutionsSearch').value === '') {
                solutionsSearchClearButton.style.display = 'none';
            } else {
                solutionsSearchClearButton.style.display = 'inline-flex';
            }
        }

        return (
            <div id="solutionsPanel">
                <div className="title-container">
                    <span>
                        <i className="far fa-lightbulb title-icon" />
                        Solutions (Canned Reports)
                    </span>
                    <button type="button" className="btn btn-link close-panel-button" onClick={() => this.closePanel()}>&#10005;</button>
                </div>
                
                <div className="tabs-container">
                    <div className="right-controls">
                        <div className="view-by-container">
                            <span>View By Type</span>
                            <div tabIndex="0" className="view-by-dropdown-button" onClick={() => this.toggleTypeOptionsDropdown()}>
                                <strong className="view-by-state">{this.state.viewByType}</strong>
                                <i className="fas fa-chevron-down" />
                            </div>
                        </div>

                        <div className="sort-by-container">
                            <span>Sort By</span>
                            <div tabIndex="0" className="sort-by-dropdown-button" onClick={() => this.toggleSortOptionsDropdown()}>
                                <strong className="sort-by-state">{this.state.sortByProperty}</strong>
                                <i className="fas fa-chevron-down" />
                            </div>
                        </div>

                        <div className="view-by-dropdown">
                            {typeRows}
                        </div>
                        <div className="sort-by-dropdown">
                            {sortRows}
                        </div>
                    </div>
                </div>
                <div className="search-container">
                    <input id="solutionsSearch" className="era-solutions-search form-control search-input" type="text" placeholder="Search" aria-label="Search" onChange={e => this.handleSearchChange(e.target.value)} />
                    <button type="button" id="solutionsSearchClearButton" className="era-solutions-search-clear-button btn bg-transparent" onClick={() => this.clearSearchInput()}>
                        <i className="fa fa-times" />
                    </button>
                </div>
                <div className="era-solutions-table">
                    {this.state.isError ? 'Unknown error occurred' : localStorage.getItem('userAccount') === null || localStorage.getItem('userAccount') === undefined ? <div>Please select a customer </div> : this.state.loading ? <div>Please wait reports are Loading...</div> : solutionsRows}
                </div>
            
            </div>
        );
    }

    handleOutsidePanelClick() {
        const solutionPanel = document.getElementById('solutionsPanel');
        const leftNavCollapseButton = document.getElementById('leftNavCollapseButton');

        if (solutionPanel && leftNavCollapseButton) {
            let context = this;
            window.addEventListener('click', function (e) {
                let clickIsOutsideOfPanel = !solutionPanel.contains(e.target);
                let clickIsOutsideOfLeftNavCollapseButton = !leftNavCollapseButton.contains(e.target);
                let clickIsOutsideOfAnchor = !document.getElementById('solutionsPanelAnchor').contains(e.target);
                let panelIsOpen = false;

                if (solutionPanel.getAttribute('style')) {
                    panelIsOpen = solutionPanel.getAttribute('style').includes('display: grid;');
                }

                if (clickIsOutsideOfPanel && clickIsOutsideOfLeftNavCollapseButton && clickIsOutsideOfAnchor && panelIsOpen) {
                    context.closePanel();
                }
            });
        }
    }

    handleSearchChange(searchTerm) {
        this.setState({ searchTerm: searchTerm }, () => this.filterSolutions());
    }

    filterSolutions() {
        let searchFiltered = this.searchFilter(this.state.solutions);
        let filteredSolutions = this.viewByTypeFilter(searchFiltered);
        let sortedSolutions = this.sortByFilter(filteredSolutions);
        this.setState({ filteredSolutions: sortedSolutions });
    }

    searchFilter(solutions) {
        let searchTerm = this.state.searchTerm;
        if (searchTerm !== '') {
            let searchFiltered = solutions.filter(solution => {
                let lcName = solution.name.toLowerCase();
                const searchFilter = searchTerm.toLowerCase();
                if (solution.description) {
                    let lcDescription = solution.description.toLowerCase();
                    return lcName.includes(searchFilter) || lcDescription.includes(searchFilter);
                } else {
                    return lcName.includes(searchFilter);
                }
            });

            return searchFiltered;
        } else {
            return solutions;
        }
    }

    viewByTypeFilter(solutions) {
        let viewByType = this.state.viewByType;
        if (viewByType !== 'All') {
            let filteredSolutions = solutions.filter(solution => {
                return solution.module.includes(viewByType);
            });

            return filteredSolutions;
        } else {
            return solutions;
        }
    }

    sortByFilter(solutions) {
        let sortByProperty = this.state.sortByProperty;
        switch (sortByProperty) {
            case 'Name':
                return solutions.sort(function (a, b) {
                    if (a.name < b.name) { return -1; }
                    if (a.name > b.name) { return 1; }
                    return 0;
                });
            case 'Type':
                return solutions.sort(function (a, b) {
                    if (a.module < b.module) { return -1; }
                    if (a.module > b.module) { return 1; }
                    return 0;
                });
            default:
                return solutions;
        }
    }

    getDashboardsState() {
        this.setState({loading: true});
        const selectedCustomer = localStorage.getItem('userAccount');
        if (this.props.userType) {
            let types = [{name: 'All', color: '#FFFFFF'}];
            for (let dashboard of this.props.solutionsData.data) {
                types.push({name: dashboard.module, color: dashboard.color});
            }

            this.setState({
                types: this.uniqueArray(types),
                loading: false,
                isError: false
            });

            return this.props.solutionsData.data;
        } else {
            if (selectedCustomer) {
                return axios.get('/looker/get/solutions?customerName=' + selectedCustomer)
                    .then((response) => {
                        let types = [{name: 'All', color: '#FFFFFF'}];
                        for (let dashboard of response.data) {
                            types.push({name: dashboard.module, color: dashboard.color});
                        }

                        this.setState({
                            types: this.uniqueArray(types),
                            loading: false
                        });

                        return response.data;
                    })
                    .catch((error) => {
                        this.setState({loading: false});
                    });
            }
        }
    }

    uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));

    solutionClick(url) {
        if (this.props.history.location.pathname.indexOf(url) !== -1) {
            this.props.history.push("/");
            setTimeout(() => {
                this.props.history.replace(url);
            });
        }
    }
    generateSolutionRows() {
        let solutionsElements = [];

        for (let solution of this.state.filteredSolutions) {
            solutionsElements.push(
                <a href={`/#/solutions/${solution.id}-${solution.name}`} onClick={() => this.solutionClick(`/solutions/${solution.id}-${solution.name}`)} className="era-solution-row" tabIndex="0">
                    <div className="era-solution-name">{solution.name}</div>
                    <div className="era-solution-type">
                        <i className="fas fa-chart-bar era-solution-type-color" style={{ color: `${solution.color}` }} />
                        {solution.module}
                    </div>
                
                    <div className="era-solution-description">{solution.description}</div>
                    <div className="era-solution-guide">
    <BWHelpIcon width="24px" height="24px"/> 
    <div className='modal'></div>
    </div>
    <div class="container">
  <button type="button"  class="btn btn-default" data-toggle="modal" data-target="#myModal"><VideoPlayer width="24px" height="24px"/> </button>


  <div class="modal fade" id="myModal" role="dialog">
    <div class="modal-dialog">
    
  
      <div class="modal-content">
        
          <button type="button" class="close" data-dismiss="modal">&times;</button>

        
        <div class="modal-body">
          <p>Some text in the modal.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
      
    </div>
  </div>
  
</div>
    <div className="era-solution-video">
    <VideoPlayer width="24px" height="24px"/>  
     </div>
                </a>
            );
        }

        return solutionsElements;
    }
    

 

    closePanel() {
        let solutionsPanel = document.querySelector('#solutionsPanel');
        solutionsPanel.style.display = 'none';
    }

    generateTypeRows() {
        let typeRows = [];

        for (let type of this.state.types) {
            typeRows.push(<div tabIndex="0" className="era-dropdown-option" onClick={() => this.filterByType(type.name)}>
                <div className="view-by-type-color" style={{ backgroundColor: `${type.color}` }} />
                {type.name}
            </div>);
        }

        return typeRows;
    }

    generateSortRows() {
        return (
            <>
                <div tabIndex="0" className="era-dropdown-option" onClick={() => this.sortBy('Name')}>Name</div>
                <div tabIndex="0" className="era-dropdown-option" onClick={() => this.sortBy('Type')}>Type</div>
            </>
        );
    }

    toggleTypeOptionsDropdown() {
        let typeOptionsDropdown = document.querySelector('.view-by-dropdown');

        if (typeOptionsDropdown.style.display === 'block') {
            typeOptionsDropdown.style.display = 'none';
        } else {
            this.closeSortOptionsDropdown();
            typeOptionsDropdown.style.display = 'block';
        }
    }

    closeTypeOptionsDropdown() {
        let typeOptionsDropdown = document.querySelector('.view-by-dropdown');
        if (typeOptionsDropdown.style.display === 'block') {
            typeOptionsDropdown.style.display = 'none';
        }
    }

    closeSortOptionsDropdown() {
        let sortOptionsDropdown = document.querySelector('.sort-by-dropdown');
        if (sortOptionsDropdown.style.display === 'block') {
            sortOptionsDropdown.style.display = 'none';
        }
    }

    toggleSortOptionsDropdown() {
        let sortOptionsDropdown = document.querySelector('.sort-by-dropdown');

        if (sortOptionsDropdown.style.display === 'block') {
            sortOptionsDropdown.style.display = 'none';
        } else {
            this.closeTypeOptionsDropdown();
            sortOptionsDropdown.style.display = 'block';
        }
    }

    filterByType(type) {
        this.closeTypeOptionsDropdown();
        this.setState({ viewByType: type }, () => this.filterSolutions());
    }

    sortBy(property) {
        this.closeSortOptionsDropdown();
        this.setState({ sortByProperty: property }, () => this.filterSolutions());
    }

    clearSearchInput() {
        document.getElementById('solutionsSearch').value = '';
        this.handleSearchChange('');
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        currentUser: state.user.currentUser,
        solutionsData: state.user.solutionData,
        userType: state.accountSettings.userType
    };
};
const SolutionsPanelComp = withRouter(SolutionsPanel);

export default connect(mapStateToProps)(SolutionsPanelComp);
