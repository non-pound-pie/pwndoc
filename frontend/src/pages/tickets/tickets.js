import { Dialog, Notify, QSpinnerGears } from 'quasar';

import AuditStateIcon from 'components/audit-state-icon'
import Breadcrumb from 'components/breadcrumb'
import CvssCalculator from 'components/cvsscalculator'
import AuditService from '@/services/audit'
import DataService from '@/services/data'
import UserService from '@/services/user'

import { $t } from '@/boot/i18n'

export default {
    data: () => {
        return {
            UserService: UserService,
            // Audits, pentesters, findings lists
            audits: [],
            pentesters: [],
            findings: [],
            // Loading state
            loading: true,
            // AuditTypes list
            auditTypes: [],
            // Languages availbable
            languages: [],
            // Datatable headers
            dtHeaders: [
                {name: 'name', label: $t('name'), field: row => row.name, align: 'left', sortable: true},
                {name: 'title', label: $t('title'), field: row => row.title, align: 'left', sortable: true},
                {name: 'Pentester', label: $t('Pentester'), field: row => row.Pentester, align: 'left', sortable: true},
                {name: 'cvssv3', label: $t('cvssv3'), field: row => CVSS31.calculateCVSSFromVector(row.cvssv3).baseSeverity, align: 'left', sortable: true},
                {name: 'address', label: $t('address'), field: row => row.address.join(', '), align: 'left', sortable: true},

            ],
            visibleColumns: ['name', 'title', 'Pentester', 'cvssv3', 'address'],
            // Datatable pagination
            pagination: {
                page: 1,
                rowsPerPage: 25,
                sortBy: 'date',
                descending: true
            },
            rowsPerPageOptions: [
                {label:'25', value:25},
                {label:'50', value:50},
                {label:'100', value:100},
                {label:'All', value:0}
            ],
            // Search filter
            search: {name: '', title: '', Pentester: ''},
            // Errors messages
            errors: {name: '', language: '', auditType: ''},
        }
    },

    components: {
        AuditStateIcon,
        Breadcrumb,
        CvssCalculator
    },

    mounted: function() {
        this.search.Pentester = this.$route.params.Pentester;

        this.getLanguages();
        this.getAuditTypes();
        this.getFindings();

    },

    computed: {
        modalAuditTypes: function() {
            return this.auditTypes.filter(type => type.stage === this.currentAudit.type)
        }
    },

    methods: {
        getLanguages: function() {
            DataService.getLanguages()
            .then((data) => {
                this.languages = data.data.datas;
            })
            .catch((err) => {
                console.log(err)
            })
        },

        getAuditTypes: function() {
            DataService.getAuditTypes()
            .then((data) => {
                this.auditTypes = data.data.datas
            })
            .catch((err) => {
                console.log(err)
            })
        },

        getFindings: function() {
            this.loading = true
            AuditService.getAllFindings()
            .then((data) => {
                this.findings = data.data.datas
                this.loading = false
            })
            .catch((err) => {
                console.log(err)
            })
        },

        customFilter: function(rows, terms) {
            var result = rows && rows.filter(row => {
                for (const [key, value] of Object.entries(terms)) { // for each search term
                  var searchString = (_.get(row, key) || "")
                  if (typeof searchString === "string")
                    searchString = searchString.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
                  var termString = (value || "")
                  if (typeof termString === "string")
                    termString = termString.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
                  if (typeof searchString !== "string" || typeof termString !== "string")
                    return searchString === termString
                  if (searchString.indexOf(termString) < 0) {
                    return false
                  }
                }
                return true
            })
            return result
          },

        created: function() {
            // Вызываем метод getFindings при создании экземпляра Vue
            this.getFindings();
          }
    }
}