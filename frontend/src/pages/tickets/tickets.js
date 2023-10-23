import { Dialog, Notify, QSpinnerGears } from 'quasar';

import AuditStateIcon from 'components/audit-state-icon'
import Breadcrumb from 'components/breadcrumb'

import AuditService from '@/services/audit'
import DataService from '@/services/data'
import CompanyService from '@/services/company'
import UserService from '@/services/user'

import { $t } from '@/boot/i18n'

export default {
    data: () => {
        return {
            UserService: UserService,
            // Audits list
            audits: [],
            pentesters: [],
            findings: [],
            // Loading state
            loading: true,
            // AuditTypes list
            auditTypes: [],
            // Companies list
            companies: [],
            // Languages availbable
            languages: [],
            // Datatable headers
            dtHeaders: [
                {name: 'name', label: $t('name'), field: row => row.name, align: 'left', sortable: true},
                {name: 'title', label: $t('title'), field: row => row.title, align: 'left', sortable: true},
                {name: 'Pentester', label: $t('Pentester'), field: row => row.Pentester, align: 'left', sortable: true},
            ],
            visibleColumns: ['name', 'title', 'Pentester'],
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
            myAudits: false,
            displayConnected: false,
            displayReadyForReview: false,
            // Errors messages
            errors: {name: '', language: '', auditType: ''},
            // Selected or New Audit
            currentAudit: {name: '', language: '', auditType: '', type: 'default'}
        }
    },

    components: {
        AuditStateIcon,
        Breadcrumb
    },

    mounted: function() {
        this.search.Pentester = this.$route.params.Pentester;

        if (this.UserService.isAllowed('audits:users-connected'))
            this.visibleColumns.push('connected')
        if (this.$settings.reviews.enabled)
            this.visibleColumns.push('reviews')

        // this.getAudits();
        this.getLanguages();
        this.getAuditTypes();
        this.getCompanies();
        this.getFindings();
        this.getPentesters();

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

         // Get Companies list
         getCompanies: function() {
            CompanyService.getCompanies()
            .then((data) => {
                this.companies = data.data.datas;
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

        getPentesters: function() {
            this.loading = true
            AuditService.getPentesters()
            .then((data) => {
                this.pentesters = data.data.datas
                this.loading = false
                console.log(this.pentesters)
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

        // Convert blob to text
        BlobReader: function(data) {
            const fileReader = new FileReader();

            return new Promise((resolve, reject) => {
                fileReader.onerror = () => {
                    fileReader.abort()
                    reject(new Error('Problem parsing blob'));
                }

                fileReader.onload = () => {
                    resolve(fileReader.result)
                }

                fileReader.readAsText(data)
            })
        },


        cleanErrors: function() {
            this.errors.name = '';
            this.errors.language = '';
            this.errors.auditType = '';
        },

        cleanCurrentAudit: function() {
            this.cleanErrors();
            this.currentAudit.name = '';
            this.currentAudit.language = '';
            this.currentAudit.auditType = '';
            this.currentAudit.type = 'default';
        },

        // Convert language locale of audit for table display
        convertLocale: function(locale) {
            for (var i=0; i<this.languages.length; i++)
                if (this.languages[i].locale === locale)
                    return this.languages[i].language;
            return ""
        },

        convertParticipants: function(row) {
            var collabs = (row.collaborators)? row.collaborators: [];
            var result = (row.creator)? [row.creator.username]: [];
            collabs.forEach(collab => result.push(collab.username));
            return result.join(', '); 
        },

        created: function() {
            // Вызываем метод getFindings при создании экземпляра Vue
            this.getFindings();
            this.getPentesters();
            // this.getFindingsTitle()
          }
    }
}